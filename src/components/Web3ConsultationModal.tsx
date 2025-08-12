import React, { useState } from 'react';
import { X, Wallet, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Expert } from '../hooks/useExperts';
import { useAuth } from '../hooks/useAuth';
import { useWeb3 } from '../hooks/useWeb3';
import { useConsultationContract } from '../hooks/useConsultationContract';
import { supabase } from '../lib/supabase';
import { Toast, useToast } from './Toast';

interface Web3ConsultationModalProps {
  expert: Expert | null;
  isOpen: boolean;
  onClose: () => void;
}

export function Web3ConsultationModal({ expert, isOpen, onClose }: Web3ConsultationModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ethAmount, setEthAmount] = useState('0.01');
  const [timeline, setTimeline] = useState('');
  const [step, setStep] = useState<'form' | 'wallet' | 'transaction' | 'success'>('form');
  const [consultationId, setConsultationId] = useState<number | null>(null);

  const { user } = useAuth();
  const { account, isConnected, connectWallet, switchToLocalNetwork, chainId } = useWeb3();
  const { initiateConsultation, loading, error } = useConsultationContract();
  const { toast, showToast, hideToast } = useToast();

  if (!isOpen || !expert) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!isConnected) {
      setStep('wallet');
      return;
    }

    if (chainId !== 1337) {
      showToast('Please switch to Hardhat local network (Chain ID: 1337)', 'warning');
      await switchToLocalNetwork();
      return;
    }

    setStep('transaction');

    try {
      const metadata = JSON.stringify({
        title,
        description,
        timeline,
        expertId: expert.id,
        clientId: user.id,
        timestamp: Date.now()
      });

      const metadataHash = btoa(metadata);

      const blockchainConsultationId = await initiateConsultation(
        account!,
        ethAmount,
        metadataHash
      );

      if (blockchainConsultationId) {
        const { error: dbError } = await supabase
          .from('consultations')
          .insert({
            expert_id: expert.id,
            client_id: user.id,
            title,
            description,
            budget: Math.round(parseFloat(ethAmount) * 1000),
            timeline,
            status: 'pending',
            blockchain_consultation_id: blockchainConsultationId,
            blockchain_metadata_hash: metadataHash
          });

        if (dbError) {
          console.error('Database error:', dbError);
          throw new Error('Failed to save consultation to database');
        }

        setConsultationId(blockchainConsultationId);
        setStep('success');
        showToast('🎉 Blockchain consultation created successfully!', 'success');
      }
    } catch (err) {
      console.error('Consultation creation error:', err);
      showToast('Failed to create consultation. Please try again.', 'error');
      setStep('form');
    }
  };

  const handleWalletConnect = async () => {
    await connectWallet();
    if (isConnected) {
      setStep('form');
      showToast('✅ Wallet connected successfully!', 'success');
    }
  };

  const handleClose = () => {
    setStep('form');
    setTitle('');
    setDescription('');
    setEthAmount('0.01');
    setTimeline('');
    setConsultationId(null);
    onClose();
  };

  const renderStep = () => {
    switch (step) {
      case 'wallet':
        return (
          <div className="text-center py-8">
            <Wallet className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Connect Your Wallet</h3>
            <p className="text-slate-600 mb-6">
              To create a blockchain-secured consultation, you need to connect your Web3 wallet.
            </p>
            <button
              onClick={handleWalletConnect}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Connect MetaMask
            </button>
            <p className="text-sm text-slate-500 mt-4">
              Make sure you're connected to the Hardhat local network (Chain ID: 1337)
            </p>
          </div>
        );

      case 'transaction':
        return (
          <div className="text-center py-8">
            <Loader className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Processing Transaction</h3>
            <p className="text-slate-600 mb-4">
              Please confirm the transaction in your wallet and wait for it to be processed on the blockchain.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Amount:</strong> {ethAmount} ETH<br />
                <strong>Consultant:</strong> {expert.profiles?.full_name}<br />
                <strong>Network:</strong> Hardhat Local (1337)
              </p>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Consultation Created!</h3>
            <p className="text-slate-600 mb-6">
              Your consultation has been successfully created on the blockchain and {ethAmount} ETH has been escrowed.
            </p>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-green-800">
                <strong>Blockchain Consultation ID:</strong> {consultationId}<br />
                <strong>Consultant:</strong> {expert.profiles?.full_name}<br />
                <strong>Amount Escrowed:</strong> {ethAmount} ETH
              </p>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              The consultant will be notified and can accept your consultation. 
              Funds will be released automatically when both parties mark the consultation as complete.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Done
            </button>
          </div>
        );

      default:
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Consultation Title
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="Brief title for your consultation request"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Project Description
              </label>
              <textarea
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="Describe your project, challenge, or question in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Amount (ETH)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Funds will be held in escrow until completion
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Timeline
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  required
                >
                  <option value="">Select timeline</option>
                  <option value="urgent">Urgent (within 24 hours)</option>
                  <option value="week">Within a week</option>
                  <option value="month">Within a month</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
                <span>🔗</span>
                <span>Blockchain-Secured Transaction</span>
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Payment is held in a smart contract escrow</li>
                <li>• Funds are only released when both parties approve completion</li>
                <li>• Built-in dispute resolution mechanism</li>
                <li>• Transparent and immutable transaction record</li>
              </ul>
            </div>

            {isConnected ? (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    Wallet connected: {account?.slice(0, 6)}...{account?.slice(-4)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Web3 wallet required for blockchain transactions
                  </span>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Processing...' : isConnected ? 'Create Consultation' : 'Connect Wallet & Create'}
              </button>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Toast {...toast} onClose={hideToast} />
      
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={expert.profiles?.avatar_url || `https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400`}
              alt={expert.profiles?.full_name || 'Expert'}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                {expert.profiles?.full_name || 'Expert'}
              </h3>
              <p className="text-blue-600 font-medium">{expert.skill_title}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-slate-600">Blockchain-Secured</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Web3</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {renderStep()}
      </div>
    </div>
  );
}