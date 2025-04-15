(function() {
    'use strict';
    
    let redirectTimeout;
    let colorSchemeQuery;
    const redirectDelay = 1900;
  
    function handleRedirect() {
      document.querySelector('.content-wrapper').style.animation = 'fadeOut 0.5s ease forwards';
      setTimeout(() => window.location.href = 'quiz.html', 500);
    }
  
    function initDarkMode() {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.classList.toggle('dark-mode', isDark);
    }
  
    function init() {
      initDarkMode();
      
      colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      colorSchemeQuery.addEventListener('change', initDarkMode);
  
      redirectTimeout = setTimeout(handleRedirect, redirectDelay);
    }
  
    document.addEventListener('DOMContentLoaded', init);
    
    window.addEventListener('beforeunload', () => {
      clearTimeout(redirectTimeout);
      if(colorSchemeQuery) colorSchemeQuery.removeEventListener('change', initDarkMode);
    });
  })();