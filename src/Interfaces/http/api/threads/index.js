const routes = require('./routes');
const ThreadsHandler = require('./handler');

module.exports = {
  name: 'threads',
  register: async (server, { injections }) => {
    const threadsHandler = new ThreadsHandler(injections);
    server.route(routes(threadsHandler));
  },
};
