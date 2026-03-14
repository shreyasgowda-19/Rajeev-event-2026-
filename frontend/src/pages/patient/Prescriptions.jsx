import { useState, useEffect } from 'react';
import { prescriptionsApi } from '../../api/prescriptions';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { 
  Pill, Calendar, User, ChevronRight, Download, 
  FileText, AlertCircle 
} from 'lucide-react';

export function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const { data } = await prescriptionsApi.getMyPrescriptions();
      setPrescriptions(data.prescriptions || []);
    } catch (error) {
      console.error('Fetch prescriptions error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      <div>
        <h1 className="text-3xl font-bold text-theme-primary">My Prescriptions</h1>
        <p className="text-theme-secondary mt-1">
          {prescriptions.length} prescriptions from your doctors
        </p>
      </div>

      {prescriptions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Pill className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-theme-secondary">No prescriptions yet</p>
            <p className="text-sm text-theme-secondary mt-1">
              Your prescriptions will appear here after doctor visits
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {prescriptions.map((prescription) => (
            <Card 
              key={prescription._id}
              className="cursor-pointer hover:shadow-md transition-all"
              onClick={() => setSelectedPrescription(
                selectedPrescription?._id === prescription._id ? null : prescription
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                      <Pill className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-theme-primary">
                        Prescription from Dr. {prescription.doctor?.name}
                      </h3>
                      <p className="text-sm text-theme-secondary mt-1">
                        {new Date(prescription.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          prescription.isActive 
                            ? 'bg-success-100 text-success-600 dark:bg-success-900/20' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800'
                        }`}>
                          {prescription.isActive ? 'Active' : 'Completed'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-theme-secondary transition-transform ${
                    selectedPrescription?._id === prescription._id ? 'rotate-90' : ''
                  }`} />
                </div>

                {/* Expanded Details */}
                {selectedPrescription?._id === prescription._id && (
                  <div className="mt-4 pt-4 border-t border-theme space-y-4">
                    {/* Diagnosis */}
                    {prescription.diagnosis && (
                      <div>
                        <h4 className="text-sm font-medium text-theme-secondary mb-1">Diagnosis</h4>
                        <p className="text-theme-primary">{prescription.diagnosis}</p>
                      </div>
                    )}

                    {/* Medicines */}
                    <div>
                      <h4 className="text-sm font-medium text-theme-secondary mb-2">Medicines</h4>
                      <div className="space-y-2">
                        {prescription.medicines?.map((medicine, idx) => (
                          <div 
                            key={idx} 
                            className="p-3 bg-theme-secondary rounded-lg flex items-start justify-between"
                          >
                            <div>
                              <p className="font-medium text-theme-primary">{medicine.name}</p>
                              <p className="text-sm text-theme-secondary">
                                {medicine.dosage} • {medicine.frequency}
                              </p>
                              {medicine.instructions && (
                                <p className="text-xs text-theme-secondary mt-1">
                                  💡 {medicine.instructions}
                                </p>
                              )}
                            </div>
                            <span className="text-sm text-theme-secondary">{medicine.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Advice */}
                    {prescription.advice && (
                      <div className="p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                        <h4 className="text-sm font-medium text-warning-700 dark:text-warning-400 mb-1">
                          Doctor's Advice
                        </h4>
                        <p className="text-sm text-warning-800 dark:text-warning-300">
                          {prescription.advice}
                        </p>
                      </div>
                    )}

                    {/* Follow Up */}
                    {prescription.followUpDate && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-primary-600" />
                        <span className="text-theme-secondary">Follow-up on:</span>
                        <span className="font-medium text-theme-primary">
                          {new Date(prescription.followUpDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex items-center space-x-1">
                        <Download className="w-4 h-4" />
                        <span>Download PDF</span>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
