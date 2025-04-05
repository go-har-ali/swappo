import { useState } from "react";
import { motion } from "framer-motion";

const MakeAnOffer = ({ product, onClose, onSubmit }) => {
  const [offerPrice, setOfferPrice] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!offerPrice || offerPrice < 1) {
      setError("Please enter a valid offer price.");
      return;
    }

    onSubmit({ productId: product.id, offerPrice });
    onClose(); // Close modal after submitting
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
      >
        <h2 className="text-xl font-bold mb-4">
          Make an Offer for {product.name}
        </h2>

        <form onSubmit={handleSubmit}>
          <label className="block text-gray-700">Your Offer Price ($):</label>
          <input
            type="number"
            className="w-full border rounded-lg p-2 mt-2"
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-lg"
            >
              Submit Offer
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default MakeAnOffer;
