function ChatHeader({

  receiverId,

}) {

  return (

    <div className="bg-green-600 text-white p-4 font-bold">

      {

        receiverId

          ? "Chat"

          : "Select a User"

      }

    </div>

  );

}

export default ChatHeader;