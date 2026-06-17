function MessageInput({

  message,

  setMessage,

  receiverId,

  user,

  socket,

  sendMessage,

}) {

  return (

    <div className="p-4 bg-white border-t flex gap-2">

      <input

        type="text"

        placeholder="Type a message..."

        value={message}

        onChange={(e) => {

          setMessage(

            e.target.value

          );

          if (receiverId) {

            socket.emit(

              "typing",

              {

                receiverId,

                senderName:

                  user.name,

              }

            );

          }

        }}

        className="flex-1 border rounded-lg px-4 py-2"

      />

      <button

        onClick={sendMessage}

        className="bg-green-600 text-white px-6 py-2 rounded-lg"

      >

        Send

      </button>

    </div>

  );

}

export default MessageInput;