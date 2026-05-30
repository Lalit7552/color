import { useState, useEffect } from "react";
import axios from "axios";
import { Clock, History, Sparkles, Lock, PlusCircle, ArrowDownToLine, Trophy, ChevronLeft, ChevronRight, X, Minus, Plus } from "lucide-react";

export default function Home() {
  const [timeLeft, setTimeLeft] = useState(60);
  const [period, setPeriod] = useState("Loading...");
  const [isLocked, setIsLocked] = useState(false);
  const [gameResults, setGameResults] = useState([]); 
  const [balance, setBalance] = useState(0);

  // Modal State (Betting Chart)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [betSelection, setBetSelection] = useState({ type: "", value: "", colorCode: "" });
  const [baseAmount, setBaseAmount] = useState(10);
  const [quantity, setQuantity] = useState(1);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Win/Loss Popup State
  const [winLossPopup, setWinLossPopup] = useState(null);

  // 1. Fetch Live Timer & Period
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/game/status`);
        if (data.success) {
          setTimeLeft(data.timeLeft);
          setPeriod(data.period);
          setIsLocked(data.isLocked);
          
          // Auto-close modal if time locks
          if (data.isLocked) setIsModalOpen(false);
        }
      } catch (error) {
        console.error("Timer fetch error");
      }
    };

    fetchStatus();
    const timer = setInterval(fetchStatus, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch Global Game Results
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/game/results`);
        if (data.success) {
          setGameResults(data.data);
        }
      } catch (error) {
        console.error("Results fetch error");
      }
    };
    fetchResults();
    const resultTimer = setInterval(fetchResults, 2000);
    return () => clearInterval(resultTimer);
  }, []);

  // 3. Poll for User Bet Results
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const lastNotifiedKey = `lastNotifiedBetId_${userId}`;
    let lastNotifiedBetId = localStorage.getItem(lastNotifiedKey) || "";

    const checkUserResult = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/game/my-history/${userId}`);
        if (data.success && data.data.length > 0) {
          const latestBet = data.data[0]; 
          
          // Check if it's resolved and not yet notified
          if (latestBet.status !== "pending" && latestBet._id !== lastNotifiedBetId) {
            setWinLossPopup({
              status: latestBet.status,
              amount: latestBet.amount,
              winningAmount: latestBet.winningAmount || 0,
              period: latestBet.period,
              color: latestBet.color,
              size: latestBet.size,
              number: latestBet.number // Added number logic
            });
            lastNotifiedBetId = latestBet._id;
            localStorage.setItem(lastNotifiedKey, latestBet._id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user history for popup", error);
      }
    };

    const interval = setInterval(checkUserResult, 3000);
    return () => clearInterval(interval);
  }, []);

  // 4. Fetch User Balance
  useEffect(() => {
    const fetchBalance = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/game/user-details/${userId}`);
        if (data.success && data.data) {
          setBalance(data.data.balance || 0);
        }
      } catch (error) {
        console.error("Balance fetch error", error);
      }
    };
    fetchBalance();
  }, [isModalOpen, winLossPopup]); // Refresh when modal opens or win/loss popup appears

  // 5. Open Bet Modal (Chart)
  const handleOpenModal = (type, value, colorCode) => {
    if (isLocked) return;
    setBetSelection({ type, value, colorCode });
    setBaseAmount(10);
    setQuantity(1);
    setIsModalOpen(true);
  };

  // 6. Confirm & Place Bet
  const handleConfirmBet = async () => {
    const userId = localStorage.getItem("userId");
    const totalAmount = baseAmount * quantity;

    if (!userId) return alert("Please login first!");
    if (totalAmount < 10) return alert("Minimum bet amount is ₹10");
    const totalDeduction = totalAmount + 0.50; // Add exact backend fee logic
    if (totalDeduction > balance) return alert(`Insufficient balance! Minimum required is ₹${totalDeduction} (including fee).`); // 🛑 Stop bet if low balance

    // Fix payload for numbers
    const payload = {
      userId, 
      type: betSelection.type, 
      amount: totalAmount
    };

    if (betSelection.type === 'number') payload.number = parseInt(betSelection.value);
    else payload.value = betSelection.value;

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/game/place-bet`, payload);
      
      if (data.success) {
        alert(`✅ Bet Placed Successfully on ${betSelection.value.toString().toUpperCase()} for ₹${totalAmount}!`);
        setIsModalOpen(false); // Close modal on success
        setBalance(prev => prev - totalDeduction); // Deduct exact amount locally for instant UI update
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to place bet!");
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // 🔥 Last Winner
  const lastWinner = gameResults.find(r => r.result && r.result !== "");

  // 📄 Pagination Logic
  const totalPages = Math.ceil(gameResults.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentResults = gameResults.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-[#0a0f1e] to-black p-4 font-sans pb-20 relative">
      <div className="max-w-md mx-auto space-y-5">
        
        {/* Quick Action Buttons */}
        <div className="flex gap-3">
          <button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-transform hover:-translate-y-0.5 flex justify-center items-center gap-2">
            <PlusCircle className="w-5 h-5" /> Recharge
          </button>
          <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-transform hover:-translate-y-0.5 flex justify-center items-center gap-2">
            <ArrowDownToLine className="w-5 h-5" /> Withdraw
          </button>
        </div>

        {/* Timer Card */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-5 flex justify-between items-center border border-gray-700/50 shadow-lg relative overflow-hidden">
          {isLocked && <div className="absolute inset-0 bg-red-500/10 animate-pulse border-2 border-red-500/50 rounded-2xl pointer-events-none"></div>}
          <div className="z-10">
            <p className="text-gray-400 text-sm mb-1 font-medium">Period</p>
            <h3 className="text-xl font-black text-white tracking-widest drop-shadow-md">{period}</h3>
          </div>
          <div className="text-right z-10">
            <p className="text-gray-400 text-sm mb-1 flex items-center justify-end gap-1 font-medium">
              <Clock className="w-4 h-4 text-yellow-400" /> Count Down
            </p>
            <h3 className={`text-3xl font-black drop-shadow-[0_0_10px_rgba(250,204,21,0.5)] ${isLocked ? "text-red-500 animate-bounce" : "text-yellow-400 animate-pulse"}`}>
              {formatTime(timeLeft)}
            </h3>
          </div>
        </div>

        {/* 🏆 Latest Result Banner */}
        {lastWinner && (() => {
          const resArr = lastWinner.result.split(',');
          const winNum = resArr[0];
          const winColors = resArr[1] ? resArr[1].split('-') : [];
          
          return (
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-4 flex justify-between items-center border border-gray-600/50 shadow-lg">
              <div>
                <p className="text-gray-400 text-xs font-medium mb-1">Previous Period</p>
                <p className="text-xl font-black text-white tracking-wider">{lastWinner.period}</p>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-gray-400 text-xs font-medium mb-1">Winning Result</p>
                <div className="flex gap-2 items-center bg-gray-800/80 px-3 py-1.5 rounded-lg border border-gray-700/50 shadow-sm">
                  <span className="text-2xl font-black text-white pr-2 border-r border-gray-600">{winNum}</span>
                  <div className="flex gap-1.5 pl-1">
                    {winColors.map((color, i) => (
                      <span key={i} className="w-4 h-4 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.5)]" 
                            style={{ backgroundColor: color === 'violet' ? '#a855f7' : color === 'red' ? '#ef4444' : '#22c55e' }}>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Prediction Action Area */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-purple-500 to-green-500"></div>

          <h3 className="text-center text-gray-300 font-bold mb-5 flex items-center justify-center gap-2 text-lg">
            {isLocked ? (
              <span className="text-red-400 flex items-center gap-2 animate-pulse"><Lock className="w-5 h-5" /> Betting Locked!</span>
            ) : (
              <><Sparkles className="w-5 h-5 text-yellow-400" /> Make Your Prediction</>
            )}
          </h3>

          <div className="flex justify-between gap-2 sm:gap-3">
            <button onClick={() => handleOpenModal("color", "green", "bg-green-500")} disabled={isLocked} className={`flex-1 bg-gradient-to-b from-green-500 to-green-600 text-white py-3 sm:py-4 rounded-xl font-black text-sm sm:text-base transition-all border border-green-400/30 flex flex-col items-center justify-center gap-1 ${isLocked ? "opacity-40 cursor-not-allowed grayscale" : "shadow-[0_4px_15px_rgba(34,197,94,0.4)] hover:scale-105 active:scale-95"}`}>
              Join Green
            </button>
            <button onClick={() => handleOpenModal("color", "violet", "bg-purple-500")} disabled={isLocked} className={`flex-1 bg-gradient-to-b from-purple-500 to-purple-600 text-white py-3 sm:py-4 rounded-xl font-black text-sm sm:text-base transition-all border border-purple-400/30 flex flex-col items-center justify-center gap-1 ${isLocked ? "opacity-40 cursor-not-allowed grayscale" : "shadow-[0_4px_15px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-95"}`}>
              Join Violet
            </button>
            <button onClick={() => handleOpenModal("color", "red", "bg-red-500")} disabled={isLocked} className={`flex-1 bg-gradient-to-b from-red-500 to-red-600 text-white py-3 sm:py-4 rounded-xl font-black text-sm sm:text-base transition-all border border-red-400/30 flex flex-col items-center justify-center gap-1 ${isLocked ? "opacity-40 cursor-not-allowed grayscale" : "shadow-[0_4px_15px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95"}`}>
              Join Red
            </button>
          </div>

          <div className="flex justify-between gap-2 sm:gap-3 mt-4">
            <button onClick={() => handleOpenModal("size", "big", "bg-orange-500")} disabled={isLocked} className={`flex-1 bg-gradient-to-b from-orange-400 to-orange-500 text-white py-3 sm:py-4 rounded-xl font-black text-sm sm:text-base transition-all border border-orange-300/30 flex flex-col items-center justify-center gap-1 ${isLocked ? "opacity-40 cursor-not-allowed grayscale" : "shadow-[0_4px_15px_rgba(249,115,22,0.4)] hover:scale-105 active:scale-95"}`}>
              Join Big
            </button>
            <button onClick={() => handleOpenModal("size", "small", "bg-blue-500")} disabled={isLocked} className={`flex-1 bg-gradient-to-b from-blue-400 to-blue-500 text-white py-3 sm:py-4 rounded-xl font-black text-sm sm:text-base transition-all border border-blue-300/30 flex flex-col items-center justify-center gap-1 ${isLocked ? "opacity-40 cursor-not-allowed grayscale" : "shadow-[0_4px_15px_rgba(59,130,246,0.4)] hover:scale-105 active:scale-95"}`}>
              Join Small
            </button>
          </div>

          {/* Numbers Selection Grid */}
          <div className="mt-5">
            <p className="text-gray-400 text-sm font-semibold mb-3 text-center flex items-center justify-center gap-1">
              Select Number <span className="text-yellow-400 font-bold bg-yellow-400/10 px-2 py-0.5 rounded text-xs ml-1">9x Payout</span>
            </p>
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                let btnColor = "bg-green-500";
                if (num === 0) btnColor = "bg-gradient-to-br from-red-500 to-purple-500";
                else if (num === 5) btnColor = "bg-gradient-to-br from-green-500 to-purple-500";
                else if (num % 2 === 0) btnColor = "bg-red-500";

                return (
                  <button 
                    key={num}
                    onClick={() => handleOpenModal("number", num.toString(), btnColor)}
                    disabled={isLocked}
                    className={`py-2.5 rounded-xl font-black text-white text-lg transition-all shadow-md hover:scale-105 active:scale-95 ${btnColor} ${isLocked ? "opacity-40 cursor-not-allowed grayscale" : ""}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 📊 Global Game Results (Paginated) */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-5 border border-gray-700/50">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" /> Game Results
          </h3>
          
          <div className="overflow-hidden rounded-xl border border-gray-700/50 mb-4">
            <table className="w-full text-center text-sm">
              <thead className="bg-gray-800 text-gray-400">
                <tr>
                  <th className="py-3 px-2 font-medium">Period</th>
                  <th className="py-3 px-2 font-medium">Number</th> 
                  <th className="py-3 px-2 font-medium">Color</th>  
                  <th className="py-3 px-2 font-medium">Size</th>
                </tr>
              </thead>
              <tbody className="text-gray-200">
                {currentResults.length > 0 ? (
                  currentResults.map((result, idx) => {
                    // String split logic
                    const resArr = result.result ? result.result.split(',') : [];
                    const winNum = resArr[0];
                    const winColors = resArr[1] ? resArr[1].split('-') : [];
                    const winSize = resArr[2];

                    // Agar result empty ya pending hai
                    const isPending = !result.result || result.result === "";

                    return (
                      <tr key={idx} className="border-b border-gray-800/50 bg-gray-900/50 hover:bg-gray-800/50 transition-colors">
                        
                        {/* 1. Period Column */}
                        <td className="py-3 px-2 font-mono text-gray-300 font-medium tracking-wide">
                          {result.period}
                        </td>

                        {/* 2. Number Column */}
                        <td className="py-3 px-2">
                          {!isPending && winNum !== undefined ? (
                            <div className="flex justify-center items-center w-fit mx-auto bg-gray-800/80 px-3 py-1 rounded-md border border-gray-700/50 shadow-sm">
                              <span className="font-bold text-white text-base">{winNum}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 font-medium italic animate-pulse">...</span>
                          )}
                        </td>

                        {/* 3. Color Column */}
                        <td className="py-3 px-2">
                          {!isPending && winColors.length > 0 ? (
                            <div className="flex justify-center items-center gap-1.5 w-fit mx-auto bg-gray-800/80 px-2 py-1.5 rounded-md border border-gray-700/50 shadow-sm">
                              {winColors.map((c, i) => (
                                <span key={i} className="w-3 h-3 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.5)]" 
                                      style={{ backgroundColor: c === 'violet' ? '#a855f7' : c === 'red' ? '#ef4444' : '#22c55e' }}></span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500 font-medium italic animate-pulse">...</span>
                          )}
                        </td>

                        {/* 4. Size Column */}
                        <td className="py-3 px-2">
                          {!isPending && winSize ? (
                            <div className="flex justify-center items-center w-fit mx-auto bg-gray-800/80 px-3 py-1 rounded-md border border-gray-700/50 shadow-sm">
                              <span className="capitalize font-bold" style={{ color: winSize === 'big' ? '#f97316' : '#3b82f6' }}>{winSize}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 font-medium italic animate-pulse">Pending...</span>
                          )}
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-gray-500">No results found</td> 
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-2">
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className={`p-2 rounded-lg bg-gray-800 border border-gray-700 text-white transition-all ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-700 active:scale-95'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-gray-400 text-sm font-medium">
                Page <span className="text-white">{currentPage}</span> of {totalPages}
              </span>
              
              <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg bg-gray-800 border border-gray-700 text-white transition-all ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-700 active:scale-95'}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🚀 Betting Modal (Chart) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm p-4 pb-24 md:p-4 animate-in fade-in duration-200">
          <div className="bg-gray-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-700 overflow-hidden transform transition-all translate-y-0">
            
            {/* Modal Header */}
            <div className={`${betSelection.colorCode} p-4 flex justify-between items-center text-white`}>
              <h2 className="text-xl font-bold uppercase tracking-wide">
                Join {betSelection.value}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/20 p-1 rounded-full hover:bg-white/30 transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Wallet Balance Display */}
              <div className="flex justify-between items-center bg-gray-800/50 p-3 rounded-xl border border-gray-700">
                <span className="text-gray-400 font-medium">Wallet Balance</span>
                <span className="text-xl font-bold text-yellow-400">₹{balance.toFixed(2)}</span>
              </div>

              {/* Contract Money Selection */}
              <div>
                <p className="text-gray-400 text-sm font-semibold mb-3">Contract Money</p>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 100, 1000, 10000].map((amt) => (
                    <button 
                      key={amt}
                      onClick={() => setBaseAmount(amt)}
                      className={`py-2 px-1 rounded-lg font-bold text-xs sm:text-sm transition-all border truncate ${
                        baseAmount === amt 
                          ? `${betSelection.colorCode.includes('gradient') ? 'text-white' : betSelection.colorCode.replace('bg-', 'text-')} border-current bg-gray-800` 
                          : "text-gray-500 border-gray-700 bg-gray-800/50 hover:bg-gray-800"
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div>
                <p className="text-gray-400 text-sm font-semibold mb-3">Multiplier (Quantity)</p>
                <div className="flex items-center justify-between gap-2 bg-gray-800 p-2 rounded-xl border border-gray-700">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex shrink-0 items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input 
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-16 bg-transparent text-center text-xl font-bold text-white focus:outline-none"
                  />
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex shrink-0 items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Total Summary & Confirm */}
              <div className="pt-4 border-t border-gray-700/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400 font-medium">Total Amount</span>
                  <span className="text-2xl font-black text-white">₹{baseAmount * quantity}</span>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-gray-300 bg-gray-800 border border-gray-700 hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmBet}
                    className={`flex-1 py-3 rounded-xl font-black text-white transition shadow-lg ${betSelection.colorCode} hover:opacity-90`}
                  >
                    Confirm Bet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🏆 Win/Loss Popup */}
      {winLossPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-gray-900 w-full max-w-sm rounded-3xl shadow-2xl border border-gray-700 overflow-hidden text-center relative">
            
            <button onClick={() => setWinLossPopup(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition z-10">
              <X className="w-6 h-6" />
            </button>

            <div className={`p-8 ${winLossPopup.status === 'win' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full mb-4 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
                   style={{ backgroundColor: winLossPopup.status === 'win' ? '#22c55e' : '#ef4444' }}>
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest drop-shadow-md">
                {winLossPopup.status === 'win' ? 'You Won!' : 'You Lost!'}
              </h2>
              <p className="text-gray-300 mb-1 font-medium">Period: <span className="font-mono text-white">{winLossPopup.period}</span></p>
              <p className="text-gray-400 text-sm mb-6">
                Bet on <span className="capitalize font-bold text-white px-2 py-0.5 rounded bg-gray-800/50">
                  {winLossPopup.number !== undefined ? winLossPopup.number : (winLossPopup.color || winLossPopup.size)}
                </span>
              </p>
              
              <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-4 border border-gray-700 shadow-inner flex justify-between items-center text-left">
                <div>
                  <p className="text-sm text-gray-400 mb-1 font-semibold">Bet Amount</p>
                  <p className="text-xl font-bold text-gray-300">₹{winLossPopup.amount}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 mb-1 font-semibold">
                    Net {winLossPopup.status === 'win' ? 'Profit' : 'Loss'}
                  </p>
                  <p className={`text-2xl font-black drop-shadow-md ${winLossPopup.status === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                    {winLossPopup.status === 'win' ? '+' : '-'}₹{
                      winLossPopup.status === 'win' 
                        ? (winLossPopup.winningAmount 
                            ? (winLossPopup.winningAmount - winLossPopup.amount).toFixed(2) 
                            : (winLossPopup.amount * 0.96).toFixed(2)) 
                        : winLossPopup.amount
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-900 border-t border-gray-800">
              <button 
                onClick={() => setWinLossPopup(null)}
                className="w-full py-3.5 rounded-xl font-black text-gray-900 bg-gradient-to-r from-gray-200 to-gray-400 hover:from-white hover:to-gray-300 transition shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}