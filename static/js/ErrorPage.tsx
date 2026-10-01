import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="dark:bg-nbk min-h-screen flex flex-col justify-center items-center">
      <button onClick={() => navigate("/")} className="bg-og text-white rounded-lg p-2 my-4">
        回首頁
      </button>

      <img
        src="/images/cover_default.jpg"
        alt="error"
        loading="eager"
        className="object-cover rounded-md w-10/12 h-auto"
      />

      <p className="text-center my-14 text-gray-400">Lost...</p>
    </div>
  );
};

export default ErrorPage;
