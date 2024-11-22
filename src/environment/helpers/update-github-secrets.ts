import axios from "axios";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as sodium from "sodium-native";

// GitHub repository details
const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const REPO_NAME = process.env.GITHUB_REPO_NAME;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Type definitions for environment variables and public key
type EnvVariables = { [key: string]: string };
type GitHubPublicKey = { key: string; key_id: string };

/**
 * Load and merge environment variables from two files.
 * @param filePath1 - Path to the first .env file
 * @param filePath2 - Path to the second .env file
 * @returns Combined environment variables
 */
const loadAndMergeEnvFiles = (...filePaths: string[]): EnvVariables => {
  let envConfig = {};
  for (const filePath of filePaths) {
    envConfig = {
      ...envConfig,
      ...dotenv.parse(fs.readFileSync(filePath)),
    };
  }
  return envConfig;
};

/**
 * Fetch the public key from GitHub for encrypting secrets.
 * @returns The public key and its ID
 */
const fetchGitHubPublicKey = async (): Promise<GitHubPublicKey> => {
  const publicKeyUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/secrets/public-key`;

  const response = await axios.get<GitHubPublicKey>(publicKeyUrl, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  return response.data;
};

/**
 * Encrypt a secret value using GitHub's public key.
 * @param value - The secret value to encrypt
 * @param publicKey - The public key
 * @returns The encrypted value in Base64 format
 */
const encryptSecret = (value: string, publicKey: string): string => {
  const secretBytes = Buffer.from(value, "utf8");
  const publicKeyBytes = Buffer.from(publicKey, "base64");
  const encryptedBytes = Buffer.alloc(
    sodium.crypto_box_SEALBYTES + secretBytes.length
  );

  sodium.crypto_box_seal(encryptedBytes, secretBytes, publicKeyBytes);

  return encryptedBytes.toString("base64");
};

/**
 * Update a single GitHub secret.
 * @param key - The name of the secret
 * @param value - The value of the secret
 * @param publicKey - The public key
 * @param keyId - The key ID associated with the public key
 */
const updateGitHubSecret = async (
  key: string,
  value: string,
  publicKey: string,
  keyId: string
): Promise<void> => {
  const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/secrets/${key}`;
  const encryptedValue = encryptSecret(value, publicKey);

  try {
    await axios.put(
      apiUrl,
      { encrypted_value: encryptedValue, key_id: keyId },
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    console.log(`✅ Successfully updated secret: ${key}`);
  } catch (error: any) {
    console.error(`❌ Failed to update secret: ${key}`);
    console.error(error.response?.data || error.message);
  }
};

/**
 * Update all secrets from merged environment variables.
 */
const updateAllSecrets = async (): Promise<void> => {
  const combinedEnv = loadAndMergeEnvFiles(".env", ".env.production.remote");

  try {
    const { key: publicKey, key_id: keyId } = await fetchGitHubPublicKey();

    for (const [key, value] of Object.entries(combinedEnv)) {
      if (key.startsWith("GITHUB")) {
        continue;
      }
      await updateGitHubSecret(key, value, publicKey, keyId);
    }

    console.log("🎉 All secrets updated successfully!");
  } catch (error: any) {
    console.error("❌ Error updating secrets:", error.message);
  }
};

// Execute the script
console.log("ℹ️ Updating GitHub secrets");
updateAllSecrets();
