import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import Head from 'next/head';

import { parsePtBrDate } from '../../utils/parsePtBrDate';
import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';
import { Comments } from '../../components/Comments';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();
  if (router.isFallback) {
    return (
      <>
        <Header />
        <div className={commonStyles.content}>Carregando...</div>
      </>
    );
  }

  const humanWordsPerMinute = 200;
  const titleWords = post.data.title.split(' ').length;

  const totalWords = post.data.content.reduce((acc, content) => {
    const headingWords = content.heading
      ? content.heading.split(' ').length
      : 0;
    const bodyWords = RichText.asText(content.body).split(' ').length;
    // eslint-disable-next-line no-param-reassign
    acc += headingWords + bodyWords;
    return acc;
  }, 0);

  const timeToRead = Math.ceil((titleWords + totalWords) / humanWordsPerMinute);

  return (
    <>
      <Head>
        <title>{post.data.title} | Space Traveling</title>
        <meta name="description" content={post.data.title} />
      </Head>
      <Header />
      <div className={styles.hero}>
        <img alt={post.data.title} src={post.data.banner.url} />
      </div>
      <article className={`${commonStyles.content} ${styles.post}`}>
        <h1>{post.data.title}</h1>
        <div className={commonStyles.postInfo}>
          <span>
            <FiCalendar />
            {parsePtBrDate(post.first_publication_date)}
          </span>
          <span>
            <FiUser />
            {post.data.author}
          </span>
          <span>
            <FiClock />
            {timeToRead} min
          </span>
        </div>
        {post.data.content.map(postData => (
          <div key={postData.heading} className={styles.postSection}>
            <h2>{postData.heading}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(postData.body),
              }}
            />
          </div>
        ))}
      </article>
      <div className={commonStyles.content} id="comments">
        <Comments />
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const { results } = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title'],
    }
  );

  const paths = results.map(post => ({ params: { slug: post.uid } }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params: { slug } }) => {
  const prismic = getPrismicClient();
  const postData = await prismic.getByUID('posts', String(slug), {});

  if (!postData) {
    return {
      notFound: true,
    };
  }

  const formatedPost = {
    data: {
      banner: {
        url: postData.data.banner.url,
      },
      author: postData.data.author,
      content: postData.data.content,
      subtitle: postData.data.subtitle,
      title: postData.data.title,
    },
    uid: postData.uid,
    first_publication_date: postData.first_publication_date,
  };

  return {
    props: {
      post: formatedPost,
    },
    revalidate: 60 * 60, // 1 hour
  };
};
