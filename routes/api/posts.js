const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('text', 'text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();
      res.json(post);
      // console.log(post);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/posts
// @desc    get all posts
// @access  Private

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });

    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});

// @route   GET api/posts/:id
// @desc    GET post by id
// @access  Private

router.get('/:id', auth, async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id);
    if (!posts) {
      return res.status(404).json({ msg: 'post not found' });
    }
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'post not found' });
    }
    res.status(500).send('server error');
  }
});

// @route  Delete api/posts/:id
// @desc   DELETE A POST
// @access Private

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'post not found' });
    }

    //Check correct user is removing the post

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await post.remove();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'post not found' });
    }
    res.status(500).send('server error');
  }
});

// @route  PUT api/posts/like/:id
// @desc   Like a post
// @access Private

router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userloggedin = req.user.id;

    //Check if the user has already liked this post

    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: 'Post already liked' });
    }
    post.likes.unshift({ user: userloggedin });
    post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'post not found' });
    }
    res.status(500).send('server error');
  }
});

// @route  PUT api/posts/unlike/:id
// @desc   Unlike a post
// @access Private

router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userloggedin = req.user.id;

    //Check if the user has not liked this post

    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ==
      0
    ) {
      return res.status(400).json({ msg: 'Post has not been liked yet!' });
    }

    //Get the index from like array to remove
    // const id = post.likes.map(like => {
    //   if (req.user.id == like.user.toString()) {
    //     return like._id;
    //   }
    // });

    const removeindex = post.likes.findIndex(like => {
      return req.user.id == like.user.toString();
    });
    // const removeId = id.join('').toString();
    // post.save();
    // post.likes.findOneAndDelete({ _id: removeId });
    post.likes.splice(removeindex, 1);
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'post not found' });
    }
    res.status(500).send('server error');
  }
});

module.exports = router;
