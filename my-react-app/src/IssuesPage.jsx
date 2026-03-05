import React from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import BottomNav from './BottomNav';

const IssuesPage = () => {

    const issues = [
        { id: 1, title: "Vasken rinner över", category: "WATER", date: "February 5th, 2026", priority: "High", status:"Open"},
        { id: 2, title: "löfdsjdhfksdhfkjdh", category: "WATER", date: "February 3rd, 2026", priority: "Medium", status:"Open"},
    ];

    return (
        <div className="min-h-screen bg-white pb-24">
            <div className="p-8">
                <h1 className="text-3xl font-bold text-blue-950">Issue Tracker</h1>
                <p className="text-gray-500 mb-6">Report and track maintenance requests</p>

                {/* Action Button */}
                <button className="w-full bg-blue-950 text-white p-3 rounded-lg flex items-center justify-center gap-2 font-medium hver:bg-blue-900 transition mb-6">
                    <Plus size={20} /> Report Issue
                </button>
            </div>

            {/* Search Filter */}
            <div className="flex gap-2 mb-6">
                <div className="flex-1 flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                    <Search size={20} className="text-gray-400 mr-2" />
                    <input type="text" placeholder="Search issues..." className="bg-transparent outline-none w-full" />
                </div>
                    <button className="border rounded-lg px-4 py-2 flex items-center gap-2 text-gray-600">
                        <Filter size={20} /> Filter
                    </button>
            </div>

                     {/* Issues List */}
            <div className="space-y-4">
                {issues.map((issue) => (
                    <div key={issue.id} className="border rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-xs text-gray-500 uppercase tracking wider">
                            <span>{issue.category} {issue.date}</span>
                        </div>
                        <h3 className="font-bold text-lg">{issue.title}</h3>
                        <div className="flex gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${issue.priority == 'High' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
                                {issue.prority}
                            </span>
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-600">
                                {issue.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <BottomNav />
        </div>
        
        
    );
}
export default IssuesPage