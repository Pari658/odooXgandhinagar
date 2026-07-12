import { useState, useEffect } from "react";

const API_URL = "http://localhost:5001/api/maintenance";
const VEHICLE_API = "http://localhost:5001/api/vehicles";

const Maintenance = () => {
  const [vehicles, setVehicles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_id: "",
    description: "",
    cost: "",
    logged_date: "",
  });

  const fetchVehicles = async () => {
    try {
      const res = await fetch(VEHICLE_API);

      if (!res.ok) throw new Error("Failed to fetch vehicles");

      const data = await res.json();

      setVehicles(
        data.vehicles.filter(
          (vehicle) => vehicle.status === "Available"
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(API_URL);

      if (!res.ok) throw new Error("Failed to fetch maintenance logs");

      const data = await res.json();

      setLogs(data.logs);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchLogs();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      // Reload data
      fetchLogs();
      fetchVehicles();

      // Reset form
      setFormData({
        vehicle_id: "",
        description: "",
        cost: "",
        logged_date: "",
      });

    } catch (err) {
      setError(err.message);
    }
  };

  const closeMaintenance = async (id) => {
    try {
      const res = await fetch(
        `${API_URL}/${id}/close`,
        {
          method: "PUT",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to close maintenance");
      }

      fetchLogs();
      fetchVehicles();

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <p className="text-sm text-gray-500 mb-2">
        Fleet Management / Operations
      </p>

      <h1 className="text-3xl font-semibold text-gray-900 mb-8">
        Maintenance
      </h1>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-6">
            Create Maintenance Record
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Vehicle */}
            <div>
              <label className="block text-sm mb-2">
                Vehicle
              </label>

              <select
                name="vehicle_id"
                value={formData.vehicle_id}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-md px-3 py-2"
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.registration_number}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm mb-2">
                Issue Description
              </label>

              <textarea
                rows="3"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-md px-3 py-2"
              />
            </div>

            {/* Cost */}
            <div>
              <label className="block text-sm mb-2">
                Cost ($)
              </label>

              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-md px-3 py-2"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm mb-2">
                Date
              </label>

              <input
                type="date"
                name="logged_date"
                value={formData.logged_date}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-md px-3 py-2"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-md py-2"
            >
              Add Maintenance
            </button>
          </form>
        </div>

        {/* Right Card */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Maintenance Logs
          </h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3">Vehicle</th>
                <th className="text-left py-3">Issue</th>
                <th className="text-left py-3">Cost</th>
                <th className="text-left py-3">Date</th>
                <th className="text-left py-3">Status</th>
                <th className="text-left py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-200">

                  <td className="py-3">
                    {log.registration_number}
                  </td>

                  <td className="py-3">
                    {log.description}
                  </td>

                  <td className="py-3">
                    ${log.cost}
                  </td>

                  <td className="py-3">
                    {log.logged_date}
                  </td>

                  <td className="py-3">
                    {log.is_closed ? "Completed" : "In Shop"}
                  </td>

                  <td className="py-3">
                    {!log.is_closed && (
                      <button
                        onClick={() => closeMaintenance(log.id)}
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        Close
                      </button>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;