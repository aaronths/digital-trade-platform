import React, { useState, useEffect } from "react";
// import axios from "axios"; // For making API requests

interface Contact {
  sender_email: string;
  reciever_email: string;
  last_message: string;
  display_name: string;
}

interface Message {
  message_id: number;
  sender_email: string;
  reciever_email: string;
  content: string;
  timestamp: string;
}

const MessagesPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]); // Active chats (contacts)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null); // Selected contact to view messages
  const [messages, setMessages] = useState<Message[]>([]); // Messages for the selected contact
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [userEmail, setUserEmail] = useState<string>("");

  const [messageInput, setMessageInput] = useState<string>("");

  // Retrieve user email from localStorage on initial load
  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) {
      setError("User is not found");
    } else {
      setUserEmail(email); // Set user email if available
    }
  }, []);

  // Fetch active chats (contacts the user has chatted with)
  useEffect(() => {
    if (!userEmail) return; // Don't fetch unless we have the email

    const fetchActiveChats = async () => {
      try {
        // Hardcoding contacts as requested
        const newContacts = [
          { sender_email: "kfc@chicken.com", reciever_email: "customersupport@kfc.com", last_message: "Why are you ordering so much chicken?", display_name: "KFC" },
          { sender_email: "khye@jacl.com", reciever_email: "khye@ad.unsw.edu.com", last_message: "Good Luck guys", display_name: "Khye" },
          { sender_email: "apple@iphone.com", reciever_email: "customersupport@apple.com", last_message: "Apple Customer Support, how could I help?", display_name: "Apple" }
        ];
        setContacts(newContacts); // Set hardcoded contacts
      } catch (error) {
        console.error("Error fetching active chats:", error);
        setError("Failed to load active chats.");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveChats();
  }, [userEmail]);

  const handleSelectContact = async (contact: Contact) => {
    setSelectedContact(contact); // Set the selected contact to view messages
    setMessages([{ message_id: Date.now(), sender_email: contact.reciever_email, reciever_email: contact.sender_email, content: contact.last_message, timestamp: new Date().toISOString() }]); // Set the last message to display when the contact is selected
  };

  const handleSendMessage = async () => {
    let message = ""; // Default empty message

    // Set different message for each contact
    if (selectedContact?.display_name === "KFC") {
      message = "Umm"; // Message for KFC
    } else if (selectedContact?.display_name === "Khye") {
      message = "Thanks"; // Message for Khye
    } else if (selectedContact?.display_name === "Apple") {
      message = "Can I have a free iPhone please?"; // Message for Apple
    }

    try {
      // Add the message to the chat window immediately after pressing Send
      setMessages([
        ...messages,
        {
          message_id: Date.now(), // Use timestamp as a temporary ID
          sender_email: userEmail,
          reciever_email: selectedContact?.reciever_email || "",
          content: message,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="d-flex" style={{ height: "100vh" }}>
      {/* Left Sidebar for Contacts */}
      <div
        className="contacts-list"
        style={{
          width: "300px",
          backgroundColor: "#2d2673",
          color: "white",
          padding: "20px",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <h4>Contacts</h4>
        {contacts.map((contact, index) => (
          <div
            key={index}
            className="contact-item"
            style={{
              padding: "10px",
              backgroundColor: "#6a4c9c",
              borderRadius: "8px",
              marginBottom: "10px",
              cursor: "pointer",
            }}
            onClick={() => handleSelectContact(contact)}
          >
            <h5>{contact.display_name}</h5>
            <p>{contact.last_message}</p>
          </div>
        ))}
      </div>

      {/* Right Panel for Message Display */}
      <div
        className="message-panel"
        style={{
          flex: 1,
          backgroundColor: "#f4f4f4",
          padding: "20px",
          height: "100vh",
          overflowY: "auto",
          marginLeft: "20px",
          borderRadius: "8px",
        }}
      >
        {selectedContact ? (
          <div>
            <h4>Conversation with {selectedContact.display_name}</h4>
            <div
              className="messages"
              style={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "20px",
                height: "80%",
                overflowY: "auto",
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.message_id}
                  style={{
                    display: "flex",
                    flexDirection: msg.sender_email === userEmail ? "row-reverse" : "row",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: msg.sender_email === userEmail ? "#F7D04B" : "#E4E9F2",
                      color: msg.sender_email === userEmail ? "black" : "black",
                      borderRadius: "10px",
                      padding: "10px",
                      maxWidth: "60%",
                    }}
                  >
                    <p><strong>{msg.sender_email}</strong></p>
                    <p>{msg.content}</p>
                    <small>{new Date(msg.timestamp).toLocaleString()}</small>
                  </div>
                </div>
              ))}
            </div>

            {/* Input field to send messages */}
            <div
              className="input-group"
              style={{
                position: "absolute",
                bottom: "20px",
                left: "20px",
                width: "95%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Type your message"
                style={{
                  borderRadius: "50px",
                  padding: "10px",
                  fontSize: "16px",
                  flex: 1,
                }}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <button
                className="btn btn-warning"
                style={{
                  borderRadius: "50px",
                  padding: "10px 20px",
                  fontSize: "16px",
                }}
                onClick={handleSendMessage}
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">Select a contact to view messages</div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
