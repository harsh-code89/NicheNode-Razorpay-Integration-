import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, DollarSign, User, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useWeb3 } from '../hooks/useWeb3';
import { useConsultationContract, ConsultationData, ConsultationStatus } from '../hooks/useConsultationContract';
import { supabase } from '../lib/supabase';

interface MyConsultationsPageProps {
  onBack: () => void;
}

interface DatabaseConsultation {
  id: string;
  title: string;
  description: string;
  timeline: string;
  status: string;
  created_at: string;
  blockchain_consultation_id?: number;
  expert_id: string;
  client_id: string;
  experts?: {
    skill_title: string;
    profiles?: {
      full_name: string;
    };
  };
  profiles?: {
    full_name: string;
  };
}

export function MyConsultationsPage({ onBack }: MyConsultationsPageProps) {
  const { user } = useAuth();
  const { account, isConnected, connectWallet } = useWeb3();
  const { getUserConsultations, getConsultation, approveCompletion, disputeConsultation, loading } = useConsultationContract();
  
  const [consultations, setConsultations] = useState<(DatabaseConsultation & { blockchainData?: ConsultationData })[]>([]);
  const [loadingConsultations, setLoadingConsultations] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      loadConsultations();
    }
  }, [user, account]);

  const loadConsultations = async () => {
    if (!user) return;

    setLoadingConsultations(true);
    try {
      // First, get the expert profile ID for the current user
      const { data: expertProfile, error: expertError } = await supabase
        .from('experts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      // Build the OR condition dynamically
      let orCondition = `client_id.eq.${user.id}`;
      if (expertProfile && !expertError) {
        orCondition += `,expert_id.eq.${expertProfile.id}`;
      }

      // Load consultations from database
      const { data: dbConsultations, error } = await supabase
        .from('consultations')
        .select(`
          *,
          experts!consultations_expert_id_fkey (
            skill_title,
            profiles!experts_user_id_fkey (full_name)
          ),
          profiles!consultations_client_id_fkey (full_name)
        `)
        .or(orCondition)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // If Web3 is connected, also load blockchain data
      if (isConnected && account) {
        const blockchainConsultationIds = await getUserConsultations();
        
        const consultationsWithBlockchainData = await Promise.all(
          (dbConsultations || []).map(async (consultation) => {
            if (consultation.blockchain_consultation_id) {
              try {
                const blockchainData = await getConsultation(consultation.blockchain_consultation_id);
                return { ...consultation, blockchainData };
              } catch (err) {
                console.error('Error loading blockchain data:', err);
                return consultation;
              }
            }
            return consultation;
          })
        );

        setConsultations(consultationsWithBlockchainData);
      } else {
        setConsultations(dbConsultations || []);
      }
    } catch (err) {
      console.error('Error loading consultations:', err);
    } finally {
      setLoadingConsultations(false);
    }
  };

  const handleApproveCompletion = async (consultationId: number) => {
    setActionLoading(consultationId);
    try {
      const success = await approveCompletion(consultationId);
      if (success) {
        await loadConsultations(); // Reload to get updated status
      }
    } catch (err) {
      console.error('Error approving completion:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDispute = async (consultationId: number) => {
    setActionLoading(consultationId);
    try {
      const success = await disputeConsultation(consultationId);
      if (success) {
        await loadConsultations(); // Reload to get updated status
      }
    } catch (err) {
      console.error('Error disputing consultation:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string, blockchainStatus?: ConsultationStatus) => {
    if (blockchainStatus !== undefined) {
      switch (blockchainStatus) {
        case ConsultationStatus.Pending: return 'bg-yellow-100 text-yellow-800';
        case ConsultationStatus.Active: return 'bg-blue-100 text-blue-800';
        case ConsultationStatus.Completed: return 'bg-green-100 text-green-800';
        case ConsultationStatus.Disputed: return 'bg-red-100 text-red-800';
        case ConsultationStatus.Cancelled: return 'bg-gray-100 text-gray-800';
        default: return 'bg-slate-100 text-slate-800';
      }
    }
    
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusText = (status: string, blockchainStatus?: ConsultationStatus) => {
    if (blockchainStatus !== undefined) {
      switch (blockchainStatus) {
        case ConsultationStatus.Pending: return 'Pending';
        case ConsultationStatus.Active: return 'Active';
        case ConsultationStatus.Completed: return 'Completed';
        case ConsultationStatus.Disputed: return 'Disputed';
        case ConsultationStatus.Cancelled: return 'Cancelled';
        default: return 'Unknown';
      }
    }
    return status.replace('_', ' ');
  };

  const formatEthAmount = (amountWei: bigint) => {
    return (Number(amountWei) / 1e18).toFixed(4);
  };

  if (loadingConsultations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading consultations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Consultations</h1>
          <p className="text-slate-600">
            Manage your blockchain-secured consultations
          </p>
        </div>

        {/* Web3 Connection Status */}
        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800">
                  Connect your wallet to view blockchain consultation details
                </span>
              </div>
              <button
                onClick={connectWallet}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        )}

        {/* Consultations List */}
        {consultations.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Consultations Yet</h3>
            <p className="text-slate-600">
              Your consultation requests and offers will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {consultations.map((consultation) => {
              const isExpert = consultation.expert_id && consultation.experts;
              const isClient = consultation.client_id === user?.id;
              const blockchainData = consultation.blockchainData;
              
              return (
                <div key={consultation.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        {consultation.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>
                            {isClient ? 'To: ' : 'From: '}
                            {isClient 
                              ? consultation.experts?.profiles?.full_name || 'Expert'
                              : consultation.profiles?.full_name || 'Client'
                            }
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(consultation.created_at).toLocaleDateString()}</span>
                        </div>
                        {consultation.timeline && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{consultation.timeline}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-slate-600 mb-4">{consultation.description}</p>
                    </div>
                    
                    <div className="ml-6 text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        getStatusColor(consultation.status, blockchainData?.status)
                      }`}>
                        {getStatusText(consultation.status, blockchainData?.status)}
                      </span>
                      {blockchainData && (
                        <div className="mt-2 text-sm text-slate-600">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{formatEthAmount(blockchainData.amount)} ETH</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Blockchain Information */}
                  {blockchainData && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-blue-900 mb-2">🔗 Blockchain Details</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700 font-medium">Contract ID:</span>
                          <p className="text-blue-800">#{Number(blockchainData.id)}</p>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">Escrow Amount:</span>
                          <p className="text-blue-800">{formatEthAmount(blockchainData.amount)} ETH</p>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">Seeker Approved:</span>
                          <p className="text-blue-800">{blockchainData.seekerApproved ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">Consultant Approved:</span>
                          <p className="text-blue-800">{blockchainData.consultantApproved ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {blockchainData && blockchainData.status === ConsultationStatus.Active && isConnected && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApproveCompletion(Number(blockchainData.id))}
                        disabled={actionLoading === Number(blockchainData.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>
                          {actionLoading === Number(blockchainData.id) ? 'Processing...' : 'Approve Completion'}
                        </span>
                      </button>
                      
                      <button
                        onClick={() => handleDispute(Number(blockchainData.id))}
                        disabled={actionLoading === Number(blockchainData.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>Dispute</span>
                      </button>
                    </div>
                  )}

                  {/* Completion Status */}
                  {blockchainData && blockchainData.status === ConsultationStatus.Active && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Waiting for completion approval:</strong>
                        {blockchainData.seekerApproved && blockchainData.consultantApproved
                          ? ' Both parties have approved. Payment will be released.'
                          : blockchainData.seekerApproved
                          ? ' Seeker approved. Waiting for consultant approval.'
                          : blockchainData.consultantApproved
                          ? ' Consultant approved. Waiting for seeker approval.'
                          : ' Both parties need to approve completion to release payment.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}