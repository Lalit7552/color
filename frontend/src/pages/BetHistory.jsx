import { useState, useEffect } from "react";
import axios from "axios";
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  Clock3, 
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Helper function for cleaner color mapping
const getBetColor = (bet) => {
  if (bet.color) return bet.color;
  if (bet.size === 'big') return '#f97316'; // orange-500
  if (bet.size === 'small') return '#3b82f6'; // blue-500
  return '#4f46e5'; // indigo-600 (default fallback)
};

export default function BetHistory() {
  const [betHistory, setBetHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = localStorage.getItem("userId");
      
      if (!userId) {
        setError("User not found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/game/my-history/${userId}`);
        
        if (data.success) {
          setBetHistory(data.data);
        } else {
          setError(data.message || "Failed to load history.");
        }
      } catch (err) {
        console.error("History fetch error", err);
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

  // Pagination Logic
  const totalPages = Math.ceil(betHistory.length / ITEMS_PER_PAGE);
  const currentBets = betHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-[#0a0f1e] to-black p-4 font-sans pb-20">
      <div className="max-w-md mx-auto space-y-5">
        
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-5 border border-gray-700/50 shadow-lg mt-4">
          <h2 className="text-xl text-white font-black flex items-center gap-2">
            <History className="w-6 h-6 text-blue-400" /> My Bet History
          </h2>
          <p className="text-gray-400 text-sm mt-1">Track your past predictions and results</p>
        </div>

        {/* History Table */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-700/50 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="overflow-x-auto">
            <table className="w-full text-center text-sm">
              <thead className="bg-gray-800 text-gray-400">
                <tr>
                  <th className="py-4 px-2 font-medium">Period</th>
                  <th className="py-4 px-2 font-medium">Bet</th>
                  <th className="py-4 px-2 font-medium">Result No.</th>
                  <th className="py-4 px-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-gray-500 animate-pulse">Loading history...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-red-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-6 h-6" />
                        <span>{error}</span>
                      </div>
                    </td>
                  </tr>
                ) : currentBets.length > 0 ? (
                  currentBets.map((bet) => (
                    <tr key={bet._id} className="border-b border-gray-800/50 bg-gray-900/50 hover:bg-gray-800/30 transition-colors">
                      {/* Period */}
                      <td className="py-4 px-2 text-gray-300 font-mono text-xs">{bet.period}</td>
                      
                      {/* User's Bet (Color or Size) */}
                      <td className="py-4 px-2">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span 
                            className="capitalize font-bold text-white px-3 py-0.5 rounded-md text-xs shadow-sm border border-white/10" 
                            style={{ backgroundColor: getBetColor(bet) }}
                          >
                            {bet.number !== undefined && bet.number !== null ? bet.number : (bet.size || bet.color)}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">₹{bet.amount}</span>
                        </div>
                      </td>
                      
                      {/* Result Number */}
                      <td className="py-4 px-2 font-black text-lg text-white">
                        {bet.resultNumber !== undefined && bet.resultNumber !== null ? bet.resultNumber : "?"}
                      </td>
                      
                      {/* Win/Loss Status */}
                      <td className="py-4 px-2 font-bold">
                        <div className="flex flex-col items-center justify-center gap-1">
                          {bet.status === "win" ? (
                            <><CheckCircle2 className="w-5 h-5 text-green-500" /> <span className="text-green-500 text-xs">WIN</span></>
                          ) : bet.status === "lose" ? (
                            <><XCircle className="w-5 h-5 text-red-500" /> <span className="text-red-500 text-xs">LOSS</span></>
                          ) : (
                            <><Clock3 className="w-5 h-5 text-yellow-500" /> <span className="text-yellow-500 text-xs">PENDING</span></>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-gray-500">No betting history found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-t border-gray-700/50">
              <button 
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 1 
                    ? "text-gray-600 bg-gray-800/30 cursor-not-allowed" 
                    : "text-white bg-gray-700 hover:bg-gray-600"
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              
              <span className="text-gray-400 text-sm">
                Page <span className="text-white font-medium">{currentPage}</span> of <span className="text-white font-medium">{totalPages}</span>
              </span>
              
              <button 
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currentPage === totalPages 
                    ? "text-gray-600 bg-gray-800/30 cursor-not-allowed" 
                    : "text-white bg-gray-700 hover:bg-gray-600"
                }`}
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}