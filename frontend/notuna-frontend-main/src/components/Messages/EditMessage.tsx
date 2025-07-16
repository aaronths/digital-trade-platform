import React, { useState } from "react";

const EditMessage: React.FC = () => {
  const [messageId, setMessageId] = useState("");
  const [newContent, setNewContent] = useState("");
  const [message, setMessage] = useState("");

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:3000/shop/messages/${messageId}/edit`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newContent }),
        }
      );
      const data = await response.json();
      setMessage(data.message || "Message updated");
    } catch (err) {
      setMessage("Edit failed");
    }
  };

  return (
    <div>
      <h4>Edit Message</h4>
      <form onSubmit={handleEdit}>
        <input
          className="form-control mb-2"
          type="number"
          placeholder="Message ID"
          value={messageId}
          onChange={(e) => setMessageId(e.target.value)}
          required
        />
        <textarea
          className="form-control mb-2"
          placeholder="New Content"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          required
        ></textarea>
        <button className="btn btn-warning">Update</button>
      </form>
      {message && <div className="mt-2 text-info">{message}</div>}
    </div>
  );
};

export default EditMessage;
