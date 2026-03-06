import React, { useContext }from "react";
import { IssuesContext } from './IssuesContext';
import { Search, Filter, Plus } from "lucide-react";
import BottomNav from "./BottomNav";
import { Link } from "react-router-dom";

const IssuesPage = () => {
  const { issues } = useContext(IssuesContext);
  

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-blue-950">Issue Tracker</h1>
        <p className="text-gray-500 mb-6">
          Report and track maintenance requests
        </p>

        {/* Action Button */}
        <Link to="/report-issues" className="w-full bg-blue-950 text-white p-3 rounded-lg flex items-center justify-center gap-2 font-medium hver:bg-blue-900 transition mb-6">
          <Plus size={20} /> Report Issue
        </Link>
      </div>

      {/* Search Filter */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 flex items-center border rounded-lg px-3 py-2 bg-gray-50">
          <Search size={20} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search issues..."
            className="bg-transparent outline-none w-full"
          />
        </div>
        <button className="border rounded-lg px-4 py-2 flex items-center gap-2 text-gray-600">
          <Filter size={20} /> Filter
        </button>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {issues.map((issue) => (
          <div key={issue.id} className="border rounded-xl p-4">
            <div className="flex justify-between items-center gap-4">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  {issue.category} {issue.date}
                </div>
                <h3 className="font-bold text-lg">{issue.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${issue.priority == "High" ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-700"}`}>
                  {issue.priority}
                </span>
                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-600">
                  {issue.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};
export default IssuesPage;
