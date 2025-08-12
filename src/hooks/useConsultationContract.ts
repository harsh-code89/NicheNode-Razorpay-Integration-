import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './useWeb3';

// Contract ABI - in a real app, this would be imported from the compiled contract
const CONSULTATION_ABI = [
  "function initiateConsultation(address payable _consultant, string memory _metadataHash) external payable returns (uint256)",
  "function acceptConsultation(uint256 consultationId) external",
  "function approveCompletion(uint256 consultationId) external",
  "function disputeConsultation(uint256 consultationId) external",
  "function cancelConsultation(uint256 consultationId) external",
  "function getConsultation(uint256 consultationId) external view returns (tuple(uint256 id, address seeker, address consultant, uint256 amount, uint8 status, uint256 createdAt, uint256 completedAt, bool seekerApproved, bool consultantApproved, string metadataHash))",
  "function getUserConsultations(address user) external view returns (uint256[])",
  "event ConsultationInitiated(uint256 indexed consultationId, address indexed seeker, address indexed consultant, uint256 amount)",
  "event ConsultationCompleted(uint256 indexed consultationId)",
  "event PaymentReleased(uint256 indexed consultationId, address indexed consultant, uint256 amount)"
];

// For demo purposes, use a hardcoded contract address
// In production, this would be loaded from environment variables or a config file
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Default Hardhat deployment address

export enum ConsultationStatus {
  Pending = 0,
  Active = 1,
  Completed = 2,
  Disputed = 3,
  Cancelled = 4
}

export interface ConsultationData {
  id: bigint;
  seeker: string;
  consultant: string;
  amount: bigint;
  status: ConsultationStatus;
  createdAt: bigint;
  completedAt: bigint;
  seekerApproved: boolean;
  consultantApproved: boolean;
  metadataHash: string;
}

export function useConsultationContract() {
  const { provider, signer, account, isConnected } = useWeb3();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (provider && signer) {
      try {
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONSULTATION_ABI, signer);
        setContract(contractInstance);
        setError(null);
      } catch (err) {
        setError('Failed to initialize contract');
        console.error('Contract initialization error:', err);
      }
    } else {
      setContract(null);
    }
  }, [provider, signer]);

  const initiateConsultation = async (
    consultantAddress: string,
    amountInEth: string,
    metadataHash: string
  ): Promise<number | null> => {
    if (!contract || !account) {
      setError('Contract not initialized or wallet not connected');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const amountInWei = ethers.parseEther(amountInEth);
      
      const tx = await contract.initiateConsultation(
        consultantAddress,
        metadataHash,
        { value: amountInWei }
      );

      const receipt = await tx.wait();
      
      // Extract consultation ID from the event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'ConsultationInitiated';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = contract.interface.parseLog(event);
        return Number(parsed?.args[0]);
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      console.error('Initiate consultation error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const acceptConsultation = async (consultationId: number): Promise<boolean> => {
    if (!contract) {
      setError('Contract not initialized');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await contract.acceptConsultation(consultationId);
      await tx.wait();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      console.error('Accept consultation error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const approveCompletion = async (consultationId: number): Promise<boolean> => {
    if (!contract) {
      setError('Contract not initialized');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await contract.approveCompletion(consultationId);
      await tx.wait();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      console.error('Approve completion error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const disputeConsultation = async (consultationId: number): Promise<boolean> => {
    if (!contract) {
      setError('Contract not initialized');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await contract.disputeConsultation(consultationId);
      await tx.wait();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      console.error('Dispute consultation error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getConsultation = async (consultationId: number): Promise<ConsultationData | null> => {
    if (!contract) {
      setError('Contract not initialized');
      return null;
    }

    try {
      const result = await contract.getConsultation(consultationId);
      return {
        id: result[0],
        seeker: result[1],
        consultant: result[2],
        amount: result[3],
        status: result[4],
        createdAt: result[5],
        completedAt: result[6],
        seekerApproved: result[7],
        consultantApproved: result[8],
        metadataHash: result[9]
      };
    } catch (err) {
      console.error('Get consultation error:', err);
      return null;
    }
  };

  const getUserConsultations = async (userAddress?: string): Promise<number[]> => {
    if (!contract) {
      setError('Contract not initialized');
      return [];
    }

    try {
      const address = userAddress || account;
      if (!address) return [];

      const consultationIds = await contract.getUserConsultations(address);
      return consultationIds.map((id: bigint) => Number(id));
    } catch (err) {
      console.error('Get user consultations error:', err);
      return [];
    }
  };

  return {
    contract,
    loading,
    error,
    isConnected,
    initiateConsultation,
    acceptConsultation,
    approveCompletion,
    disputeConsultation,
    getConsultation,
    getUserConsultations,
    ConsultationStatus
  };
}