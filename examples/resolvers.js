const fetch = require('node-fetch')

function getUsers () {
  return fetch('https://jsonplaceholder.typicode.com/users')
    .then(res => res.json())
}

function getUser (_, { id }) {
  return fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
    .then(res => res.json())
}

function getUserAlbums ({ id }) {
  return fetch(`https://jsonplaceholder.typicode.com/users/${id}/albums`)
    .then(res => res.json())
}

function getAlbum (_, { id }) {
  return fetch(`https://jsonplaceholder.typicode.com/albums/${id}`)
    .then(res => res.json())
}

function getAlbums () {
  return fetch(`https://jsonplaceholder.typicode.com/albums`)
    .then(res => res.json())
}

function getAlbumPhotos ({ id }) {
  return fetch(`https://jsonplaceholder.typicode.com/albums/${id}/photos`)
    .then(res => res.json())
}

function getUserTodos ({ id }) {
  return fetch(`https://jsonplaceholder.typicode.com/users/${id}/todos`)
    .then(res => res.json())
}

function getUserPosts ({ id }) {
  return fetch(`https://jsonplaceholder.typicode.com/users/${id}/posts`)
    .then(res => res.json())
}

function getPosts () {
  return fetch(`https://jsonplaceholder.typicode.com/posts`)
    .then(res => res.json())
}

function getPost (_, { id }) {
  return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
    .then(res => res.json())
}

function getPostComments ({ id }) {
  return fetch(`https://jsonplaceholder.typicode.com/posts/${id}/comments`)
    .then(res => res.json())
}

function getContextUser ({ userId }) {
  return fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
    .then(res => res.json())
}

// function getTodo (_, { id }) {
//   return fetch(`https://jsonplaceholder.typicode.com/todos/${id}`)
//     .then(res => res.json())
// }

function getTodos () {
  return fetch(`https://jsonplaceholder.typicode.com/todos`)
    .then(res => res.json())
}

module.exports = {
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
  getPostComments
}
