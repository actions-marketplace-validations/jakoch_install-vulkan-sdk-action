/*---------------------------------------------------------------------------------------------
 *  SPDX-FileCopyrightText: 2021-2025 Jens A. Koch
 *  SPDX-License-Identifier: MIT
 *--------------------------------------------------------------------------------------------*/

import * as tc from '@actions/tool-cache'
import * as errors from './errors'
import * as versionsRasterizers from './versions_rasterizers'
import * as http from './http'

/**
 * Install the Mesa3D lavapipe library.
 *
 * @export
 * @param {string} version - The version of the Mesa lavapipe.
 * @param {string} destination - The destination path for the Mesa lavapipe.
 */
export async function installLavapipe(destination: string): Promise<string> {
  let installPath = ''

  const downloadUrl = await getDownloadUrl()
  const archivePath = await tc.downloadTool(downloadUrl)
  installPath = await extract(archivePath, destination)

  return installPath
}

/**
 * Get the download URL for the latest lavapipe library.
 *
 * @export
 * @returns {Promise<string>} - The download URL for the latest Lavapipe library.
 */
export async function getDownloadUrl(): Promise<string> {
  const latestVersions = await versionsRasterizers.getLatestVersionsJson()
  const version = latestVersions.latest['lavapipe-win64'].version
  const downloadUrl = latestVersions.latest['lavapipe-win64'].url

  try {
    if (!downloadUrl) throw new Error('Lavapipe download URL not found.')
    await http.isDownloadable('Lavapipe', version, downloadUrl)
  } catch (error) {
    errors.handleError(error as Error)
    throw error // Rethrow the error so it can be caught in tests
  }

  return downloadUrl
}

/**
 * Extract the Lavapipe library from the ZIP archive.
 *
 * @export
 * @param {string} archivePath - The path to the Lavapipe archive.
 * @param {string} destination - The destination path for the library.
 * @returns {Promise<string>} - The path to the extracted library.
 */
export async function extract(archivePath: string, destination: string): Promise<string> {
  return await tc.extractZip(archivePath, destination)
}

/*export async function setup(installPath: string, rasterizer: string): Promise<void> {
  // setup
  const deploymentType = '1'

  const cmdArgs = ['.\\systemwidedeploy.cmd', deploymentType]
  const setupArgs = cmdArgs.join(' ')

  const runAsAdminCmd = `powershell.exe Start-Process -FilePath '${installPath}' -Args '${setupArgs}' -Verb RunAs -Wait`

  core.debug(`Command: ${runAsAdminCmd} `)

  try {
    await execSync(runAsAdminCmd)
    //let stdout: string = execSync(run_as_admin_cmd, {stdio: 'inherit'}).toString().trim()
    //process.stdout.write(stdout)
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.error(error.toString())
    } else {
      core.error('An unknown error occurred')
    }
    core.setFailed(`Installer failed. Arguments used: ${runAsAdminCmd}`)
  }

  // https://docs.mesa3d.org/envvars.html
  // https://docs.mesa3d.org/install.html?highlight=icd#vulkan
  // https://docs.mesa3d.org/drivers/lavapipe.html

  // Since 08-2023: VK_ICD_FILENAMES replaced by VK_DRIVER_FILES
  // https://github.com/KhronosGroup/Vulkan-Loader/commit/4830af39d

  let icdDriverFilename = 'lvp_icd.x86_64.json'

  if (rasterizer === 'lavapipe') {
    icdDriverFilename = 'lvp_icd.x86_64.json'
  } else if (rasterizer === 'dozen') {
    icdDriverFilename = 'dzn_icd.x86_64.json'
  }

  // linux : install_path/share/vulkan/icd/

  const vkDriverFiles = `${installPath}/x64/${icdDriverFilename}`

  core.exportVariable('VK_DRIVER_FILES', vkDriverFiles)
  core.info(`✔️ [ENV] Set env variable VK_DRIVER_FILES -> "${vkDriverFiles}".`)

  const galliumDriver = `lavapipe`

  core.exportVariable('GALLIUM_DRIVER', galliumDriver)
  core.info(`✔️ [ENV] Set env variable GALLIUM_DRIVER -> "${galliumDriver}".`)

  //reg add HKEY_LOCAL_MACHINE\SOFTWARE\Khronos\Vulkan\Drivers /v "${{ github.workspace }}\mesa\x64\lvp_icd.x86_64.json" /t REG_DWORD /d 0
}*/
