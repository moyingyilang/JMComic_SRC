const ErrorPage = () => {
  return (
    <div className="dark:bg-nbk min-h-screen flex flex-col justify-center items-center">
      {/* <iframe
        src="https://comicloveu.com/"
        style={{ width: "100%", height: "100vh", border: "none" }}
        title="ComicLoveU"
        sandbox=""
        referrerPolicy="no-referrer"
      /> */}
      <button onClick={() => (window.location.href = "/")} className="bg-og text-white rounded-lg p-2 my-4">
        回上一頁
      </button>
      <img
        src="/images/cover_default.jpg"
        alt="cover_default"
        loading="lazy"
        onLoad={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.opacity = "1";
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/images/cover_default.jpg";
        }}
        className="object-cover rounded-md w-10/12 h-auto"
        style={{
          opacity: "0",
          transition: "opacity 0.5s ease-in-out",
        }}
      />
      <p className="text-center my-14">Lost...</p>
    </div>
  );
};

export default ErrorPage;
