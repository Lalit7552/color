import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, Clock, CheckCircle, XCircle, ChevronLeft } from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default function Transaction() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;

        // Yahan par aap apne actual API endpoint ka path daalein
        const response = await fetch(`${import.meta.env.VITE_API_URL}/wallet/transactions/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Agar API nahi mili (404 error) to HTML padhne se pehle hi error throw kar do
        if (!response.ok) {
          throw new Error("API Not Found or Server Error");
        }

        const result = await response.json();

        if (result.success && result.data.length > 0) {
          setTransactions(result.data);
        } else {
          setTransactions([]);
        }
      } catch (error) {
        console.error("Transaction fetch karne me error:", error);
        // Ab error aane par dummy data nahi balki empty array set hoga
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [navigate]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "success": return <CheckCircle size={16} className="text-green-400" />;
      case "pending": return <Clock size={16} className="text-yellow-400" />;
      case "failed": return <XCircle size={16} className="text-red-400" />;
      default: return <Clock size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="p-4 pt-6 max-w-md mx-auto w-full pb-24">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
          <ChevronLeft size={24} className="text-white" />
        </button>
        <h2 className="text-2xl font-bold text-white ml-4">Transactions</h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center text-gray-400 py-10">Koi transaction nahi mila.</div>
      ) : (
        <div className="space-y-4">
          {transactions.map((txn) => (
            <div key={txn._id} className="bg-[#1a2133] rounded-2xl p-4 shadow-lg border border-gray-800 flex justify-between items-center hover:bg-[#252d43] transition">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${txn.type === 'deposit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {txn.type === 'deposit' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                </div>
                <div>
                  <h3 className="text-white font-bold capitalize">{txn.type}</h3>
                  <p className="text-gray-400 text-xs">{new Date(txn.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <h3 className={`text-lg font-bold ${txn.type === 'deposit' ? 'text-green-400' : 'text-white'}`}>
                  {txn.type === 'deposit' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                </h3>
                <div className="flex items-center justify-end space-x-1 mt-1 text-xs capitalize text-gray-300">
                  {getStatusIcon(txn.status)} <span>{txn.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}