import React, { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { MOCK_COLLEGE_FACULTY } from '../data/mockData';

export default function CollegeFacultyPage() {
  const [facultyList, setFacultyList] = useState(MOCK_COLLEGE_FACULTY);
  const [editIndex, setEditIndex] = useState(-1);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    dept: '',
    designation: '',
    qualification: '',
    experience: '',
    document: ''
  });

  const handleEdit = (index) => {
    const f = facultyList[index];
    setEditIndex(index);
    setFormData({
      id: f.id,
      name: f.name,
      dept: f.dept,
      designation: f.designation || 'Assistant Professor',
      qualification: f.qualification,
      experience: f.experience,
      document: f.document
    });
  };

  const handleReset = () => {
    setEditIndex(-1);
    setFormData({
      id: '',
      name: '',
      dept: '',
      designation: '',
      qualification: '',
      experience: '',
      document: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.id) return;

    if (editIndex >= 0) {
      const updated = [...facultyList];
      updated[editIndex] = {
        ...updated[editIndex],
        ...formData
      };
      setFacultyList(updated);
    } else {
      setFacultyList([
        ...facultyList,
        {
          ...formData,
          status: 'Pending'
        }
      ]);
    }
    handleReset();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
              Institutional HR Roster
            </span>
            <span className="text-xs text-slate-400 font-mono">Academic Verification</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 font-outfit mt-1">
            Faculty Cadre &amp; Qualification Registry
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Register academic teaching appointments, attach doctorate certifications, and track regulatory verification status.
          </p>
        </div>
      </div>

      {/* Registration & Edit Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-bold text-slate-800 text-sm font-outfit">
            {editIndex >= 0 ? 'Update Faculty Details' : 'Register New Faculty Member'}
          </h3>
          {editIndex >= 0 && (
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200 font-bold">
              Editing: {formData.id}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Faculty ID / AICTE ID *</label>
            <input
              type="text"
              required
              placeholder="e.g. FAC-106"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name &amp; Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Meera Nambiar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Department *</label>
            <input
              type="text"
              required
              placeholder="e.g. Computer Science & Eng"
              value={formData.dept}
              onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Designation</label>
            <input
              type="text"
              placeholder="e.g. Associate Professor"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Highest Qualification *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ph.D. (IIT Roorkee)"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Teaching Experience</label>
            <input
              type="text"
              placeholder="e.g. 10 Years"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block font-bold text-slate-700 mb-1">Uploaded Degree Document / Certificate Record</label>
            <input
              type="text"
              placeholder="e.g. Doctorate_Degree_Certificate_IITR_2018.pdf"
              value={formData.document}
              onChange={(e) => setFormData({ ...formData, document: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition"
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm transition"
            >
              {editIndex >= 0 ? 'Update Faculty Record' : 'Save Faculty Member'}
            </button>
          </div>
        </form>
      </div>

      {/* Faculty Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden p-5 space-y-3">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="font-bold text-slate-800 text-sm font-outfit">Registered Faculty Roster</h3>
          <span className="text-xs text-slate-500 font-mono">{facultyList.length} Total Faculty</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                <th className="p-3.5">ID &amp; Faculty Name</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Designation</th>
                <th className="p-3.5">Qualification</th>
                <th className="p-3.5">Document Details</th>
                <th className="p-3.5">Verification</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {facultyList.map((fac, idx) => (
                <tr key={fac.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-800">{fac.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{fac.id}</p>
                  </td>
                  <td className="p-3.5 text-slate-700">{fac.dept}</td>
                  <td className="p-3.5 text-slate-700">{fac.designation || 'Faculty'}</td>
                  <td className="p-3.5 font-medium text-indigo-900">{fac.qualification}</td>
                  <td className="p-3.5 text-slate-600 max-w-xs truncate">{fac.document}</td>
                  <td className="p-3.5">
                    <StatusBadge status={fac.status} size="xs" />
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleEdit(idx)}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-[11px] transition inline-flex items-center gap-1 border border-indigo-200"
                    >
                      <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                      <span>Update</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
