import { Link } from "react-router-dom";

export default function Main() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Link
        to="/ranking"
        className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition"
      >??KBO ?� ?�위 보러가�?/Link>"
    </div>
  );
}
