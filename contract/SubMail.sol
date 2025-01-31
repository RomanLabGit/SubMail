// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

contract SubMail {

    // single message and its metadata
    struct message {
        address sender;
        uint256 timestamp;
        string msg;
    }

    // Event to be emitted when a message is sent
    event MessageSent(address indexed sender, address indexed recipient, uint256 timestamp, string message);

    // Collection of messages sent to the user
    mapping(address => message[]) allMessages;
    
    // Sends a new message to a user
    function sendMessage(address to_key, string calldata _msg) external {
        message memory newMsg = message(msg.sender, block.timestamp, _msg);
        allMessages[to_key].push(newMsg);

        // Emit the MessageSent event
        emit MessageSent(msg.sender, to_key, block.timestamp, _msg);
    }
    
    // Returns all the messages sent to the user
    function readMessages() external view returns(message[] memory) {
        return allMessages[msg.sender];
    }
}
