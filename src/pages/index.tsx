import Prismic from '@prismicio/client';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { GetStaticProps } from 'next';

import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';
import { parsePtBrDate } from '../utils/parsePtBrDate';

import { Loader } from '../components/Loader';
import Header from '../components/Header';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const { results: postList, next_page } = postsPagination;

  const [posts, setPosts] = useState(postList);
  const [nextPage, setNextPage] = useState<string | null>(next_page);
  const [isLoading, setIsLoading] = useState(false);

  const loadMorePosts = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { results, next_page: newNextPage } = await fetch(
        nextPage
      ).then(response => response.json());

      const newPosts = results.map(post => ({
        uid: post.uid,
        first_publication_date: parsePtBrDate(post.first_publication_date),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      }));

      setNextPage(newNextPage);
      setPosts([...posts, ...newPosts]);
    } catch (e) {
      console.error('Error loading posts:', e.message);
    }
    setIsLoading(false);
  };

  const seeMoreButton = isLoading ? (
    <Loader />
  ) : (
    <button type="button" className={styles.loadMore} onClick={loadMorePosts}>
      Carregar mais posts
    </button>
  );

  return (
    <>
      <Head>
        <title>Home | Space Traveling</title>
        <meta name="description" content="Posts incr??veis toda semana!" />
      </Head>
      <Header />
      <main className={`${commonStyles.content} ${styles.mainContent}`}>
        {posts.map(post => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a className={styles.post}>
              <h2>{post.data.title}</h2>
              <p>{post.data.subtitle}</p>
              <div className={commonStyles.postInfo}>
                <span>
                  <FiCalendar />
                  {parsePtBrDate(post.first_publication_date)}
                </span>
                <span>
                  <FiUser />
                  {post.data.author}
                </span>
              </div>
            </a>
          </Link>
        ))}
        {nextPage && seeMoreButton}
        {preview && (
          <aside className={commonStyles.exitPreview}>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const { next_page, results } = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 3,
      ref: previewData?.ref ?? null,
      orderings: '[document.first_publication_date desc]',
    }
  );
  const formatedPosts = results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));

  return {
    props: {
      postsPagination: { next_page, results: formatedPosts },
      preview,
    },
    revalidate: 60 * 30, // 30 min
  };
};
