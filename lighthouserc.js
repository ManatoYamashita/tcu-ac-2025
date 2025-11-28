module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/blogs',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': 'off',
        'categories:best-practices': 'off',
        'categories:seo': 'off',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
