import React, { Component } from "react";
import { PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import "./Home.css";
import { API, Auth } from "aws-amplify";
import { LinkContainer } from "react-router-bootstrap";

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      posts: [],
      user: '',
    };
  }

  async componentDidMount() {
    if (!this.props.isAuthenticated) {
      return;
    }
  
    try {
      this.setState({ user: await Auth.currentAuthenticatedUser() });
      const posts = await this.fetchPosts();

      this.setState({ posts });
    } catch (e) {
      console.error(e);
    }
  
    this.setState({ isLoading: false });
  }
  
  async fetchPosts() {
    const posts = await API.get("backend-v1", "/posts", {});

    return posts.data.sort(function(a, b){return b.createdAt-a.createdAt});
  }

  renderPostsList(posts) {
    return [{}].concat(posts).map(
      (post, i) =>
        i !== 0
          ? <LinkContainer
              key={post.postId}
              to={`/posts/${post.postId}`}
            >
              <ListGroupItem header={post.content.trim().split("\n")[0]}>
                {"Created: " + new Date(post.createdAt).toLocaleString('en-AU')}
              </ListGroupItem>
            </LinkContainer>
          : <LinkContainer
              key="new"
              to="/posts/create"
            >
              <ListGroupItem>
                <h4>
                  <b>{"\uFF0B"}</b> New post
                </h4>
              </ListGroupItem>
            </LinkContainer>
    );
  }
  
  renderLander() {
    return (
      <div className="lander">
        <h1>All Posts</h1>
      </div>
    );
  }

  renderPosts() {
    return (
      <div className="posts">
        <PageHeader>What's Happening in Your Network</PageHeader>
        <ListGroup>
          {!this.state.isLoading && this.renderPostsList(this.state.posts)}
        </ListGroup>
      </div>
    );
  }

  render() {
    return (
      <div className="Home">
        {this.props.isAuthenticated ? this.renderPosts() : this.renderLander()}
      </div>
    );
  }
}
