module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
  ? '/f18pay-frontend/' // note the trailing slash
  : '/',
}