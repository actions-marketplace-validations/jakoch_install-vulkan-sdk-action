/*---------------------------------------------------------------------------------------------
 *  SPDX-FileCopyrightText: 2021-2025 Jens A. Koch
 *  SPDX-License-Identifier: MIT
 *--------------------------------------------------------------------------------------------*/

import * as tc from '@actions/tool-cache'
import * as versionsRasterizers from './versions_rasterizers'
import * as http from './http'
import * as errors from './errors'

/**
 * Install the SwiftShader library.
 *
 * @export
 * @param {string} destination - The destination path for the SwiftShader library.
 */
export async function installSwiftShader(destination: string): Promise<string> {
  let installPath = ''

  const downloadUrl = await getDownloadUrl()
  const archivePath = await tc.downloadTool(downloadUrl)
  installPath = await extract(archivePath, destination)

  return installPath
}

/**
 * Get the download URL for the latest SwiftShader library.
 *
 * @export
 * @returns {Promise<string>} - The download URL for the latest SwiftShader library.
 */
export async function getDownloadUrl(): Promise<string> {
  const latestVersions = await versionsRasterizers.getLatestVersionsJson()
  const downloadUrl = latestVersions.latest['swiftshader-win64']?.url
  const version = latestVersions.latest['swiftshader-win64'].version

  try {
    if (!downloadUrl) throw new Error('SwiftShader download URL not found.')
    await http.isDownloadable('SwiftShader', version, downloadUrl)
  } catch (error) {
    errors.handleError(error as Error)
    throw error // Rethrow the error so it can be caught in tests
  }

  return downloadUrl
}

/**
 * Extract the SwiftShader library from the ZIP archive.
 *
 * @export
 * @param {string} archivePath - The path to the SwiftShader archive.
 * @param {string} destination - The destination path for the library.
 * @returns {Promise<string>} - The path to the extracted library.
 */
export async function extract(archivePath: string, destination: string): Promise<string> {
  return await tc.extractZip(archivePath, destination)
}
