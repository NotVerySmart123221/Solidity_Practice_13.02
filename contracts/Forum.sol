// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Forum {
    struct Post {
        uint id;
        string message;
        address author;
        uint timestamp;
        uint likes;
        bool exists;
    }

    Post[] public posts;
    address public owner;
    mapping(uint => mapping(address => bool)) public hasLiked;

    constructor() {
        owner = msg.sender;
    }

    function create_post(string memory _msg) external {
        posts.push(Post(posts.length, _msg, msg.sender, block.timestamp, 0, true));
    }

    function toggle_like(uint _id) external {
        require(posts[_id].exists, "No post");
        if (hasLiked[_id][msg.sender]) {
            posts[_id].likes--;
            hasLiked[_id][msg.sender] = false;
        } else {
            posts[_id].likes++;
            hasLiked[_id][msg.sender] = true;
        }
    }

    function delete_post(uint _id) external {
        require(posts[_id].author == msg.sender, "Not author");
        posts[_id].exists = false;
    }

    function clear_posts() external {
        require(msg.sender == owner, "Not owner");
        delete posts;
    }

    function get_posts() external view returns (Post[] memory) {
        return posts;
    }
}