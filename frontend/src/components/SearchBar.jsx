import React from 'react'

export const SearchBar = () => {
    return (
        <div className="flex-1 flex justify-center">
            <input
                type="text"
                placeholder="Search..."
                className="w-1/2 px-4 py-2 rounded-full shadow-md focus:outline-none focus:ring focus:ring-blue-100"
            />
        </div>
    )
}

export default SearchBar;