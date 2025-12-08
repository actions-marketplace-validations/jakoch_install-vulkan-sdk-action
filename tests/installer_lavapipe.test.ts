/*---------------------------------------------------------------------------------------------
 *  SPDX-FileCopyrightText: 2021-2025 Jens A. Koch
 *  SPDX-License-Identifier: MIT
 *--------------------------------------------------------------------------------------------*/

import { installLavapipe, getDownloadUrl, extract } from '../src/installer_lavapipe'
import * as tc from '@actions/tool-cache'
import * as versionsRasterizers from '../src/versions_rasterizers'
import * as http from '../src/http'
import * as core from '@actions/core' // Import @actions/core for mocking

jest.mock('@actions/tool-cache')
jest.mock('../src/versions_rasterizers')
jest.mock('../src/http')

describe('installer_lavapipe', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('installLavapipe', () => {
    it('should download and extract the lavapipe library', async () => {
      const mockDownloadUrl = 'https://example.com/lavapipe.zip'
      const mockArchivePath = '/path/to/archive.zip'
      const mockInstallPath = '/path/to/install'

      jest.spyOn(tc, 'downloadTool').mockResolvedValue(mockArchivePath)
      jest.spyOn(tc, 'extractZip').mockResolvedValue(mockInstallPath)
      jest.spyOn(versionsRasterizers, 'getLatestVersionsJson').mockResolvedValue({
        latest: {
          'lavapipe-win64': { version: '1.0.0', tag: 'v1.0.0', url: mockDownloadUrl },
          'swiftshader-win64': { version: '1.0.0', tag: 'v1.0.0', url: 'https://example.com/swiftshader.zip' }
        }
      })
      jest.spyOn(http, 'isDownloadable').mockResolvedValue(undefined)

      const result = await installLavapipe(mockInstallPath)

      expect(tc.downloadTool).toHaveBeenCalledWith(mockDownloadUrl)
      expect(tc.extractZip).toHaveBeenCalledWith(mockArchivePath, mockInstallPath)
      expect(result).toBe(mockInstallPath)
    })
  })

  describe('getDownloadUrl', () => {
    it('should return the download URL for the latest lavapipe library', async () => {
      const mockDownloadUrl = 'https://example.com/lavapipe.zip'
      jest.spyOn(versionsRasterizers, 'getLatestVersionsJson').mockResolvedValue({
        latest: {
          'lavapipe-win64': { version: '1.0.0', tag: 'v1.0.0', url: mockDownloadUrl },
          'swiftshader-win64': { version: '1.0.0', tag: 'v1.0.0', url: 'https://example.com/swiftshader.zip' }
        }
      })
      jest.spyOn(http, 'isDownloadable').mockResolvedValue(undefined)

      const result = await getDownloadUrl()

      expect(result).toBe(mockDownloadUrl)
      expect(http.isDownloadable).toHaveBeenCalledWith('Lavapipe', '1.0.0', mockDownloadUrl)
    })

    it('should handle errors when download URL is not found', async () => {
      jest.spyOn(versionsRasterizers, 'getLatestVersionsJson').mockResolvedValue({
        latest: {
          'lavapipe-win64': { version: '1.0.0', tag: 'v1.0.0', url: '' },
          'swiftshader-win64': { version: '1.0.0', tag: 'v1.0.0', url: 'https://example.com/swiftshader.zip' }
        }
      })

      const spy = jest.spyOn(core, 'setFailed').mockImplementation(jest.fn())
      await expect(getDownloadUrl()).rejects.toThrow('Lavapipe download URL not found.')

      expect(spy).toHaveBeenCalledWith(expect.stringContaining('Lavapipe download URL not found.'))
      spy.mockRestore()
    })
  })

  describe('extract', () => {
    it('should extract the ZIP archive to the specified destination', async () => {
      const mockArchivePath = '/path/to/archive.zip'
      const mockDestination = '/path/to/destination'
      const mockExtractedPath = '/path/to/extracted'

      jest.spyOn(tc, 'extractZip').mockResolvedValue(mockExtractedPath)

      const result = await extract(mockArchivePath, mockDestination)

      expect(tc.extractZip).toHaveBeenCalledWith(mockArchivePath, mockDestination)
      expect(result).toBe(mockExtractedPath)
    })
  })
})
