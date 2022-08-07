import * as core from '@actions/core'
import * as fs from 'fs'
import * as platform from './platform'
import * as tc from '@actions/tool-cache'
import * as path from 'path'
//import { exec } from '@actions/exec'
import {execFileSync, execSync} from 'child_process'

export async function install_vulkan_sdk(sdk_path: string, destination: string, version: string): Promise<string> {
  let install_path = ''

  core.info(`📦 Extracting Vulkan SDK...`)

  if (platform.IS_MAC) {
    // TODO
  }

  if (platform.IS_LINUX) {
    install_path = await extract_archive(sdk_path, destination)
    const cachedPath = await tc.cacheDir(install_path, 'vulkan_sdk', version, platform.OS_ARCH)
    core.addPath(cachedPath)
  }

  if (platform.IS_WINDOWS) {
    // TODO allow installing optional components
    // --confirm-command install com.lunarg.vulkan.32bit
    //                           com.lunarg.vulkan.thirdparty
    //                           com.lunarg.vulkan.debug
    //                           com.lunarg.vulkan.debug32

    let cmd_args = [
      //sdk_path,
      '--root',
      destination,
      '--accept-licenses',
      '--default-answer',
      '--confirm-command',
      'install'
    ]
    let install_cmd = cmd_args.join(' ')

    // powershell.exe Start-Process
    //   -FilePath 'VulkanSDK-1.3.216.0-Installer.exe'
    //   -Args '--root C:\VulkanSDK --accept-licenses --default-answer --confirm-command install'
    //   -Verb runas

    try {
      //const run_as_admin_cmd = `pwsh runas.exe /noprofile /user:Administrator "${install_cmd}"`
      const run_as_admin_cmd = `powershell.exe Start-Process -FilePath '${sdk_path}' -Args '${install_cmd}' -Verb RunAs`
      //core.info(`Install Command: ${run_as_admin_cmd}`)
      let stdout: string = execSync(run_as_admin_cmd).toString().trim()
      process.stdout.write(stdout)
      install_path = destination
      //TODO CACHE
      // SEE https://github.com/gitleaks/gitleaks-action/blob/f65dee2ef48e96e7a5a2b775b131c3d81b2e73ea/src/gitleaks.js#L46
    } catch (error: any) {
      core.setFailed(`Installer failed: ${install_cmd}`)
    }
  }
  return path.normalize(install_path)
}

export async function install_vulkan_runtime(runtime_archive_filepath: string, destination: string): Promise<string> {
  core.info(`📦 Extracting Vulkan Runtime...`)
  const runtime_destination = path.normalize(`${destination}/runtime`)
  const install_path = extract_archive(runtime_archive_filepath, runtime_destination)
  return install_path
}

async function extract_archive(file: string, destination: string): Promise<string> {
  const extract = tc.extractTar
  if (platform.IS_WINDOWS) {
    if (file.endsWith('.exe')) {
      return destination
    } else if (file.endsWith('.zip')) {
      const extract = tc.extractZip
    } else if (file.endsWith('.7z')) {
      const extract = tc.extract7z
    }
  } else if (platform.IS_MAC) {
    const extract = tc.extractXar
  } else {
    const extract = tc.extractTar
  }
  return await extract(file, destination)
}

function verify_installation_of_sdk(sdk_path?: string): boolean {
  let r = false
  if (platform.IS_LINUX || platform.IS_MAC) {
    r = fs.existsSync(`${sdk_path}/bin/vulkaninfo`)
  }
  if (platform.IS_WINDOWS) {
    const file = path.normalize(`${sdk_path}/bin/vulkaninfoSDK.exe`)
    r = fs.existsSync(file)
  }
  return r
}

function verify_installation_of_runtime(sdk_path?: string): boolean {
  let r = false
  if (platform.IS_WINDOWS) {
    const file = path.normalize(`${sdk_path}/runtime/vulkan-1.dll`)
    r = fs.existsSync(file)
  }
  return r
}
