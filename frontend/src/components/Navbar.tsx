import React, { Suspense, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import axios from "axios";
import { List } from "../types/media";
import { useMediaLength } from "../context/mediaLengthContext";

// lazy load the components
const Menu = React.lazy(() => import("./Menu"));
const SearchMenu = React.lazy(() => import("./SearchMenu"));
const UserMenu = React.lazy(() => import("./UserMenu"));

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lists, setLists] = useState<List[]>();
  const [query, setQuery] = useState<string>("");
  const { mediaLength, fetchMediaLength } = useMediaLength();
  const [focus, setFocus] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("All");

  // Show the user menu when the user authorized
  const handleLog = async () => {
    if (user) {
      setShowUserMenu((prev) => !prev);
    } else navigate("/sign");
  };

  // Fetch user's watchlist
  useEffect(() => {
    if (!user) return;
    fetchMediaLength();
  }, [user]);

  // Fetch user lists
  useEffect(() => {
    const getList = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_MONGODB_API}/lists`, {
          withCredentials: true,
        });

        setLists(data);
      } catch (error: any) {
        console.error(error?.response?.data || "An error occurred");
      }
    };

    getList();
  }, []);

  // Fetch list Media
  const handleMedia = async (list: List, edit?: boolean) => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_MONGODB_API}/lists/${list.name}`, {
        withCredentials: true,
      });
      const media = data?.movies;

      if (user) {
        navigate("/listDetails", {
          state: {
            lists,
            listTitle: list.name,
            description: list.description,
            data: media,
            edit,
          },
        });
      } else {
        navigate("/sign");
      }
    } catch (error: any) {
      console.error(error?.response?.data || "An error occurred while fetching the list");
    }
  };

  // Navigate to the search page when pressing Enter key and the input it's valid
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && focus && query.trim() !== "") {
        navigate("/search", { state: { query, filter: searchText } });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focus, query, searchText]);

  return (
    <div className="bg-black-100 h-16 max-md:h-14">
      <Suspense
        fallback={
          <div className="animate-spin w-6 h-6 border-4 border-secondary rounded-full border-l-secondary-100"></div>
        }
      >
        <div className="container relative flex items-center justify-between max-lg:justify-center gap-2 w-full h-full py-4 font-bold">
          <Link to={"/"} className="group relative">
            <h1
              data-testid="imdb-logo"
              className=" bg-primary py-0.5 px-1.5 max-lg:py-2 max-lg:px-0.5 max-md:py-1.5 max-md:px-3 text-xl max-lg:text-3xl max-md:text-base font-black rounded"
            >
              IMDB
            </h1>
            <span className="group-hover:block absolute top-0 left-0 w-full h-full bg-overlay hidden z-20"></span>
          </Link>
          <div
            data-testid="menuBtn"
            className="max-lg:hidden flex items-center gap-1 w-max h-full py-1 px-3 text-white text-sm cursor-pointer rounded hover:bg-gray"
            onClick={(): void => setShowMenu(true)}
          >
            <MenuIcon />
            <span>Menu</span>
            <Menu showMenu={showMenu} setShowMenu={setShowMenu} />
          </div>
          <div
            className="max-lg:hidden relative flex items-center w-3/5 h-full"
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          >
            <div
              className="relative flex items-center justify-center h-full w-max py-1.5 pl-2 pr-0.5 bg-white font-semibold text-sm cursor-pointer select-none rounded hover:bg-gray-200 border-r border-r-gray-300 border-br-none border-tr-none"
              onClick={(): void => setShowSearch((prev) => !prev)}
            >
              <span className="text-md">{searchText}</span>
              {showSearch ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
              <SearchMenu
                showSearch={showSearch}
                setShowSearch={setShowSearch}
                setSearchText={setSearchText}
                menuFor="Navbar"
              />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 h-full p-2 bg-white text-base font-medium rounded outline-none"
              placeholder="Search IMDB"
              style={{ borderTopLeftRadius: "0", borderBottomLeftRadius: "0" }}
            />
            <span className="absolute right-0 top-0 h-full pr-2 flex items-center text-gray-300">
              <SearchIcon className="cursor-pointer" />
            </span>
          </div>
          <p className="max-lg:hidden py-1 px-3 text-white text-sm rounded hover:bg-gray border-r-2 border-gray-300 cursor-pointer">
            IMDB<span className="text-md text-secondary">Pro</span>
          </p>
          <div
            onClick={() => lists && handleMedia(lists[0])}
            className="max-lg:hidden flex items-center gap-1 w-max h-full py-1 px-3 text-white text-sm rounded hover:bg-gray"
          >
            <LibraryAddIcon />
            <div className="flex items-center gap-2">
              <span>Watchlist</span>{" "}
              {user && (
                <span className="text-black text-sm bg-primary rounded-lg py-0.5 px-2">
                  {mediaLength}
                </span>
              )}
            </div>
          </div>
          <button
            data-testid="btn"
            className="max-lg:hidden relative py-1 px-3 text-white text-sm rounded hover:bg-gray"
            style={{ marginLeft: "-0.5rem" }}
            onClick={handleLog}
          >
            {user ? (
              <div className="flex items-center gap-1 w-full h-full">
                <AccountCircleIcon className="text-white" />
                <span>{user}</span>
                <UserMenu showUserMenu={showUserMenu} setshowUserMenu={setShowUserMenu} />
              </div>
            ) : (
              "Sign In"
            )}
          </button>
          <span className="max-lg:hidden py-1 px-3 text-white text-sm rounded hover:bg-gray cursor-pointer">
            EN
          </span>
        </div>
      </Suspense>
    </div>
  );
};

export default Navbar;
