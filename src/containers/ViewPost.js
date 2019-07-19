import React, { Component } from "react";
import { ListGroupItem, ButtonToolbar, Button } from "react-bootstrap";
import "./ViewPost.css";
import { API } from "aws-amplify";
import { Auth } from "aws-amplify";

export default class ViewPost extends Component {
  constructor(props) {
    super(props);

    this.state = {
      postId: this.props.match.params[0],
      post: {
        createdAt: null,
        content: null,
        userId: null,
        likedBy: [],
      },
      liked: false,
      isLoading: true,
    };
  }

  defaultLikeBy(post) {
    if (typeof post.likedBy === 'undefined' || !Array.isArray(post.likedBy)) {
      post.likedBy = [];
    }

    return post;
  }

  async componentDidMount() {
    try {
      const response = await this.getPost(this.state.postId);
      const post = response.data;

      const user = await Auth.currentAuthenticatedUser();
      const userId = user.getUsername();

      const state = {
        post,
        isLoading: false,
      };

      this.defaultLikeBy(post);

      if (post.likedBy && post.likedBy.includes(userId)) {
        state.liked = true;
      }

      this.setState(state);
    } catch (error) {
      console.error(error);
    }
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

   handleOnClick = async event => {
    let response;
    if (this.state.liked) {
      response = await this.unlikePost(this.state.postId);
      this.setState({ liked: false });
    } else {
      response = await this.likePost(this.state.postId);
      this.setState({ liked: true });
    }

    this.setState({ post: this.defaultLikeBy(response.data) });
  }

  async likePost(postId) {
    return API.patch("backend-v1", `/posts/${postId}?action=like`, {});
  }

  async unlikePost(postId) {
    return API.patch("backend-v1", `/posts/${postId}?action=unlike`, {});
  }

  async getPost(postId) {
    return API.get("backend-v1", `/posts/${postId}`, {});
  }

  render() {
    return (
      <div className="ViewPost">
          <ListGroupItem>{this.state.post.content}</ListGroupItem>
          <ButtonToolbar>
            <Button onClick={this.handleOnClick} variant="outline-primary">{this.state.liked ? 'Unlike' : 'Like'}</Button>
          </ButtonToolbar>
          <br />
          <p>{!this.state.isLoading && this.state.post.likedBy.length > 0 ? 'Liked By: '.concat(this.state.post.likedBy.join(', ')) : null}</p>
      </div>
    );
  }
}
