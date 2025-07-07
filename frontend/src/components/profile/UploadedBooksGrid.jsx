import BookCard from "../ui/bookcard";

export default function UploadedBooksGrid({ books, isOwnProfile, alreadyRequestedIds=[], onDeleteBook }) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {books && books.length === 0 ? (
        <p>No books uploaded.</p>
      ) : (
        books.map((book) => (
          <BookCard key={book._id} book={book} ownUser={isOwnProfile} showOwner={false} isRequested={alreadyRequestedIds.includes(book._id)} onDelete={() => onDeleteBook(book._id)} />
        ))
      )}
    </div>
  );
}
