function MessageList({

  messages,

  senderId,

  formatTime,

  messagesEndRef,

}) {

  return (

    <div className="flex-1 overflow-y-auto p-4">

      {messages.map(

        (msg, index) => (

          <div

            key={index}

            className={`

            mb-3 flex

            ${

              String(

                msg.senderId

              ) ===

              String(senderId)

                ? "justify-end"

                : "justify-start"

            }

          `}

          >

            <div

              className={`

              px-4 py-2

              rounded-lg

              max-w-xs

              ${

                String(

                  msg.senderId

                ) ===

                String(senderId)

                  ? "bg-green-500 text-white"

                  : "bg-white border"

              }

            `}

            >

              <div>

                {msg.message}

              </div>

              <div

                className={`

                text-xs mt-1

                ${

                  String(

                    msg.senderId

                  ) ===

                  String(senderId)

                    ? "text-green-100"

                    : "text-gray-500"

                }

              `}

              >

                {

                  msg.createdAt

                    ? formatTime(

                        msg.createdAt

                      )

                    : ""

                }

              </div>

            </div>

          </div>

        )

      )}

      <div ref={messagesEndRef}></div>

    </div>

  );

}

export default MessageList;