export const Comments: React.FC = () => (
  <section
    ref={elem => {
      if (!elem) {
        return;
      }
      const scriptElem = document.createElement('script');
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
      elem.appendChild(scriptElem);
    }}
  />
);
