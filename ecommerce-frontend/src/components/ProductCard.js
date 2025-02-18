export default function ProductCard({ product }) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold">{product.name}</h2>
        <p className="text-gray-600">{product.description}</p>
        <p className="text-blue-500 font-bold">${product.price}</p>
      </div>
    );
  }