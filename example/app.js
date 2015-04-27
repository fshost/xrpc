var os = require('os');

var express = require('express');

var xrpc = require('..');

var app = express();

app.use(xrpc.xmlRpc);

// example implementing one of the methods from the metaWeblog API (blogger.getUsersBlogs)
// to test interaction use Windows Live Writer, MarsEdit, or other metaWeblog-compatible blogging client
// (or see the test script for how to test using a node.js xmlrpc client)
app.post('/RPC', xrpc.route({
    blogger: {
        getUsersBlogs: function (key, username, password, callback) {
                    callback(null, [{ url: 'http://programmingcorner.blogspot.com', blogid: 1, blogName: 'my blog' }]);
        }
    }
    metaWeblog: {
       newPost: function(blogid, username, password, post, publish, callback) {
           callback(null, "http://blog/posts/124");
       },
       editPost: function(postid, username, password, post, publish, callback) {

           callback(null, true);
       },
       getPost: function(postid, username, password, callback) {

           callback(null, { dateCreated: new Date(), description: 'Post description', title: 'Post Title', categories: ['categoryA', 'categoryB'], permalink: 'http://blog/posts/124', postid: '123', userid: 'user1', wp_slug: 'slug123' });
       },
       getCategories: function(blogid, username, password, callback) {
           callback(null, [{ description: 'Category description', htmlUrl: 'http://blog/categories/cat1', rssUrl: 'http://blog/categories/cat1/rss', title: 'Category Title', categoryid: 'cat1', }]);
       },
       getRecentPosts: function(blogid, username, password, numberOfPosts, callback) {

           callback(null, [{ dateCreated: new Date(), description: 'Post description', title: 'Post Title', categories: ['categoryA', 'categoryB'], permalink: 'http://blog/posts/124', postid: '123', userid: 'user1', wp_slug: 'slug123' }]);
       },
       newMediaObject: function(blogid, username, password, mediaObject, callback) {
           callback(null, { url: 'http://blog/media/5as4d5as4', });
       },
   },
   blogger: {
       deletePost: function(key, postid, username, password, publish, callback) {
           callback(null, false);
       },
       getUsersBlogs: function(key, username, password, callback) {
	       console.log('getuserblogs called with key:', key, 'username:', username, 'and password:', password);
           callback(null, [{ blogid: 'blog1', url: 'http://blog/', blogName: 'Some blog', }]);
       },
       getUserInfo: function(key, username, password, callback) {
           callback(null, { userid: 'user1', firstname: 'James', lastname: 'Hickok', nickname: 'Wild Bill', email: 'bill@hickok.com', url: 'http://billhickok.com', });
       },
   }
}));


app.listen(3000);
console.log('listening for XML-RPC calls on http://' + os.hostname() + ':3000/RPC');
