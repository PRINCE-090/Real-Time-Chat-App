function Sidebar({

  users,

  receiverId,

  setReceiverId,

  onlineUsers,

  logout,

  search,

  setSearch,

}) {

  const filteredUsers = users.filter((u) =>

    u.name
      .toLowerCase()
      .includes(
        search.toLowerCase()
      )

  );

  return (

    <div className="w-1/4 bg-white border-r flex flex-col">

      <div className="p-4 bg-green-600 text-white flex justify-between items-center">

        <h2 className="font-bold text-lg">

          Chats

        </h2>

        <button

          onClick={logout}

          className="bg-red-500 px-3 py-1 rounded"

        >

          Logout

        </button>

      </div>

      <div className="p-3">

        <input

          type="text"

          placeholder="🔍 Search user..."

          value={search}

          onChange={(e) =>

            setSearch(e.target.value)

          }

          className="w-full border rounded-lg px-3 py-2"

        />

      </div>

      <div className="flex-1 overflow-y-auto">

        {filteredUsers.map((u) => (

          <div

            key={u._id}

            onClick={() =>

              setReceiverId(u._id)

            }

            className={`

              p-4

              cursor-pointer

              border-b

              hover:bg-gray-100

              ${

                receiverId === u._id

                  ? "bg-green-100"

                  : ""

              }

            `}

          >

            <div className="font-semibold">

              {

                onlineUsers.includes(

                  String(u._id)

                )

                  ? "🟢 "

                  : "⚫ "

              }

              {u.name}

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}

export default Sidebar;