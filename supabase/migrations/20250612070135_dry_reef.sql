/*
  # Add blockchain fields to consultations table

  1. Changes
    - Add blockchain_consultation_id column to track smart contract consultation ID
    - Add blockchain_metadata_hash column to store IPFS/metadata hash
    - Add blockchain_transaction_hash column to store transaction hash
    - Add blockchain_status column to track blockchain-specific status

  2. Security
    - No changes to existing RLS policies
*/

-- Add blockchain-related columns to consultations table
DO $$
BEGIN
  -- Add blockchain_consultation_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultations' AND column_name = 'blockchain_consultation_id'
  ) THEN
    ALTER TABLE consultations ADD COLUMN blockchain_consultation_id integer;
  END IF;

  -- Add blockchain_metadata_hash column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultations' AND column_name = 'blockchain_metadata_hash'
  ) THEN
    ALTER TABLE consultations ADD COLUMN blockchain_metadata_hash text;
  END IF;

  -- Add blockchain_transaction_hash column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultations' AND column_name = 'blockchain_transaction_hash'
  ) THEN
    ALTER TABLE consultations ADD COLUMN blockchain_transaction_hash text;
  END IF;

  -- Add blockchain_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultations' AND column_name = 'blockchain_status'
  ) THEN
    ALTER TABLE consultations ADD COLUMN blockchain_status text;
  END IF;
END $$;

-- Add index on blockchain_consultation_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_consultations_blockchain_id 
ON consultations(blockchain_consultation_id);

-- Add index on blockchain_transaction_hash for faster lookups
CREATE INDEX IF NOT EXISTS idx_consultations_blockchain_tx 
ON consultations(blockchain_transaction_hash);