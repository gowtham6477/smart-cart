import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to SmartCart
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your one-stop solution for service bookings
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/services" className="btn-primary">
            Browse Services
          </Link>
          <Link to="/auth/login" className="btn-secondary">
            Sign In
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-4xl mb-4">🚗</div>
          <h3 className="text-xl font-bold mb-2">Car Wash</h3>
          <p className="text-gray-600">Professional car cleaning services</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-4xl mb-4">🏠</div>
          <h3 className="text-xl font-bold mb-2">Home Cleaning</h3>
          <p className="text-gray-600">Deep cleaning for your home</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-4xl mb-4">👔</div>
          <h3 className="text-xl font-bold mb-2">Laundry</h3>
          <p className="text-gray-600">Wash, iron, and fold services</p>
        </div>
      </div>
    </div>
  );
}

