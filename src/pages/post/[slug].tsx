import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import Head from 'next/head';

import { parsePtBrDate } from '../../utils/parsePtBrDate';
import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

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
        <div>Carregando...</div>
      </>
    );
  }

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
            <FiClock />4 min
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
  };
};
