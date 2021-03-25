import { useEffect } from 'react';

export const Comments = (): JSX.Element => {
  useEffect(() => {
    const scriptElem = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-uterances');
    scriptElem.src = 'https://utteranc.es/client.js';
    scriptElem.async = true;
    scriptElem.crossOrigin = 'anonymous';
    scriptElem.setAttribute(
      'repo',
      'profdangarcia/ignite-challenge-space-traveling'
    );
    scriptElem.setAttribute('issue-term', 'pathname');
    scriptElem.setAttribute('label', 'blog-comment');
    scriptElem.setAttribute('theme', 'dark-blue');
    anchor.appendChild(scriptElem);
  }, []);

  return <div id="inject-comments-for-uterances" />;
};
