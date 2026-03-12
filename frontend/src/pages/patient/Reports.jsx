import { useState, useEffect, useRef } from 'react';
import { reportsApi } from '../../api/reports';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { 
  Upload, FileText, X, ChevronDown, ChevronUp, 
  Calendar, Share2, Trash2, Download, Filter 
} from 'lucide-react';

const reportTypes = [
  { value: 'lab_report', label: 'Lab Report', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20' },
  { value: 'prescription', label: 'Prescription', color: 'bg-green-100 text-green-600 dark:bg-green-900/20' },
  { value: 'imaging', label: 'Imaging/X-Ray', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800' },
];

export function Reports() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedType, setSelectedType] = useState('');
  const [expandedReport, setExpandedReport] = useState(null);
  const [filterType, setFilterType] = useState('');
  const fileInputRef = useRef(null);

  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'lab_report',
    description: '',
    file: null,
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await reportsApi.getMyReports();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Fetch reports error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadForm({ ...uploadForm, file });
      // Auto-fill title from filename
      if (!uploadForm.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        setUploadForm(prev => ({ ...prev, title: fileName }));
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('title', uploadForm.title);
      formData.append('type', uploadForm.type);
      formData.append('description', uploadForm.description);

      await reportsApi.upload(formData);
      
      // Reset form
      setUploadForm({ title: '', type: 'lab_report', description: '', file: null });
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Refresh list
      fetchReports();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (reportId) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await reportsApi.delete(reportId);
      fetchReports();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const filteredReports = filterType 
    ? reports.filter(r => r.type === filterType)
    : reports;

  // Group by date
  const groupedReports = filteredReports.reduce((groups, report) => {
    const date = new Date(report.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(report);
    return groups;
  }, {});

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-theme-primary">My Health Records</h1>
          <p className="text-theme-secondary mt-1">
            {reports.length} reports stored securely
          </p>
        </div>
        
        <Button 
          onClick={() => document.getElementById('upload-section').scrollIntoView({ behavior: 'smooth' })}
          className="flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Report</span>
        </Button>
      </div>

      {/* Upload Section */}
      <Card id="upload-section" className="border-2 border-dashed border-primary-300 dark:border-primary-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-primary-600" />
            <span>Upload New Report</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Report Title *"
                placeholder="e.g., Blood Test Report - March 2026"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-1">
                  Report Type *
                </label>
                <select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-theme bg-theme-primary text-theme-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  {reportTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-primary mb-1">
                Description (Optional)
              </label>
              <textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Add any notes about this report..."
                className="w-full px-4 py-2 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[80px]"
              />
            </div>

            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-theme rounded-lg cursor-pointer bg-theme-secondary hover:bg-theme-hover transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-theme-secondary" />
                  <p className="text-sm text-theme-secondary">
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-theme-secondary mt-1">
                    PDF, JPG, PNG up to 5MB
                  </p>
                  {uploadForm.file && (
                    <p className="text-sm text-primary-600 font-medium mt-2">
                      Selected: {uploadForm.file.name}
                    </p>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  required
                />
              </label>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-theme-secondary text-center">Uploading...</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setUploadForm({ title: '', type: 'lab_report', description: '', file: null });
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={isUploading}
              >
                Clear
              </Button>
              <Button 
                type="submit" 
                isLoading={isUploading}
                disabled={!uploadForm.file || !uploadForm.title}
              >
                Upload Report
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <Filter className="w-5 h-5 text-theme-secondary flex-shrink-0" />
        <button
          onClick={() => setFilterType('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            !filterType 
              ? 'bg-primary-600 text-white' 
              : 'bg-theme-secondary text-theme-secondary hover:bg-theme-hover'
          }`}
        >
          All Types
        </button>
        {reportTypes.map(type => (
          <button
            key={type.value}
            onClick={() => setFilterType(type.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filterType === type.value
                ? 'bg-primary-600 text-white'
                : 'bg-theme-secondary text-theme-secondary hover:bg-theme-hover'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {Object.keys(groupedReports).length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-theme-secondary">No reports uploaded yet</p>
              <p className="text-sm text-theme-secondary mt-1">
                Upload your first medical report above
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedReports).map(([month, monthReports]) => (
            <div key={month}>
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-theme-primary">{month}</h2>
                <span className="text-sm text-theme-secondary">({monthReports.length} reports)</span>
              </div>

              <div className="space-y-3">
                {monthReports.map((report) => {
                  const typeConfig = reportTypes.find(t => t.value === report.type) || reportTypes[3];
                  const isExpanded = expandedReport === report._id;

                  return (
                    <Card 
                      key={report._id}
                      className="overflow-hidden transition-all hover:shadow-md"
                    >
                      <div 
                        className="p-4 cursor-pointer"
                        onClick={() => setExpandedReport(isExpanded ? null : report._id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-medium text-theme-primary">{report.title}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${typeConfig.color}`}>
                                  {typeConfig.label}
                                </span>
                                <span className="text-xs text-theme-secondary">
                                  {new Date(report.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {report.isShared && (
                              <span className="text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-600 px-2 py-1 rounded-full">
                                Shared
                              </span>
                            )}
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-theme-secondary" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-theme-secondary" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-theme">
                          {report.description && (
                            <p className="text-sm text-theme-secondary mt-3">
                              {report.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-theme">
                            <div className="flex space-x-2">
                              <a
                                href={report.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                <span>Download</span>
                              </a>
                              <button className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-theme-secondary hover:bg-theme-secondary rounded-lg transition-colors">
                                <Share2 className="w-4 h-4" />
                                <span>Share</span>
                              </button>
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(report._id);
                              }}
                              className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
