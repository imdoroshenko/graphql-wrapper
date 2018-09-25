const
  { GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLList,
    GraphQLBoolean,
  } = require('graphql')
const
  { getTodo,
    getTodos,
    getAlbum,
    getAlbums,
    getAlbumPhotos,
    getUser,
    getUsers,
    getContextUser,
    getUserAlbums,
    getUserTodos,
    getUserPosts,
    getPost,
    getPosts,
    getPostComments,
  } = require('./resolvers')

const Photo = new GraphQLObjectType({
  name: 'Photo',
  fields: {
    albumId: {type: GraphQLInt},
    id: {type: GraphQLInt},
    title: {type: GraphQLString},
    url: {type: GraphQLString},
    thumbnailUrl: {type: GraphQLString},
  }
})

const Albums = new GraphQLObjectType({
  name: 'Album',
  fields: () => ({
    userId: {type: GraphQLInt},
    id: {type: GraphQLInt},
    title: {type: GraphQLString},
    user: {
      type: User,
      resolve: getContextUser
    },
    photos: {
      type: new GraphQLList(Photo),
      resolve: getAlbumPhotos,
    }
  })
})

const Address = new GraphQLObjectType({
  name: 'Address',
  fields: {
    street: {type: GraphQLString},
    suite: {type: GraphQLString},
    city: {type: GraphQLString},
    zipcode: {type: GraphQLString},
  }
})

const Todo = new GraphQLObjectType({
  name: 'Todo',
  fields: () => ({
    userId: {type: GraphQLInt},
    id: {type: GraphQLInt},
    title: {type: GraphQLString},
    completed: {type: GraphQLBoolean},
    user: {
      type: User,
      resolve: getContextUser
    },
  })
})

const User = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: {type: GraphQLInt},
    name: {type: GraphQLString},
    username: {type: GraphQLString},
    email: {type: GraphQLString},
    phone: {type: GraphQLString},
    website: {type: GraphQLString},
    address: {type: Address},
    albums: {
      type: new GraphQLList(Albums),
      resolve: getUserAlbums
    },
    todos: {
      type: new GraphQLList(Todo),
      resolve: getUserTodos
    },
    posts: {
      type: new GraphQLList(Albums),
      resolve: getUserPosts
    },
  }
})

const Comment = new GraphQLObjectType({
  name: 'Comment',
  fields: {
    postId: {type: GraphQLInt},
    id: {type: GraphQLInt},
    name: {type: GraphQLString},
    email: {type: GraphQLString},
    body: {type: GraphQLString},
  }
})

const Post = new GraphQLObjectType({
  name: 'Post',
  fields: {
    userId: {type: GraphQLInt},
    id: {type: GraphQLInt},
    title: {type: GraphQLString},
    body: {type: GraphQLString},
    user: {
      type: User,
      resolve: getContextUser
    },
    comments: {
      type: new GraphQLList(Comment),
      resolve: getPostComments
    }
  }
})

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    user: {
      args: { id: { type: GraphQLInt } },
      type: User,
      resolve: getUser,
    },
    users: {
      type: new GraphQLList(User),
      resolve: getUsers,
    },
    post: {
      args: { id: { type: GraphQLInt } },
      type: Post,
      resolve: getPost,
    },
    posts: {
      type: new GraphQLList(Post),
      resolve: getPosts,
    },
    album: {
      args: { id: { type: GraphQLInt } },
      type: Albums,
      resolve: getAlbum,
    },
    albums: {
      type: new GraphQLList(Albums),
      resolve: getAlbums,
    },
    todo: {
      args: { id: { type: GraphQLInt } },
      type: Todo,
      resolve: getTodo,
    },
    todos: {
      type: new GraphQLList(Todo),
      resolve: getTodos,
    }
  }
})

module.exports = {
  Query
}
