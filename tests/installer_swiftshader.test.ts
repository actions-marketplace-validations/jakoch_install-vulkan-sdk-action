import { installSwiftShader, getDownloadUrl, extract } from '../src/installer_swiftshader'
import * as tc from '@actions/tool-cache'
import * as versionsRasterizers from '../src/versions_rasterizers'
import * as http from '../src/http'
import * as errors from '../src/errors'

jest.mock('@actions/tool-cache')
jest.mock('../src/versions_rasterizers')
jest.mock('../src/http')
jest.mock('../src/errors')

describe('installer_swiftshader', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('installSwiftShader', () => {
    it('should download and extract the SwiftShader library', async () => {
      const mockDownloadUrl = 'https://example.com/swiftshader.zip'
      const mockArchivePath = '/path/to/archive.zip'
      const mockInstallPath = '/path/to/install'

      jest.spyOn(tc, 'downloadTool').mockResolvedValue(mockArchivePath)
      jest.spyOn(tc, 'extractZip').mockResolvedValue(mockInstallPath)
      jest.spyOn(versionsRasterizers, 'getLatestVersionsJson').mockResolvedValue({
        latest: {
          'swiftshader-win64': { version: '1.0.0', tag: 'v1.0.0', url: mockDownloadUrl },
          'lavapipe-win64': { version: '1.0.0', tag: 'v1.0.0', url: 'https://example.com/lavapipe.zip' }
        }
      })
      jest.spyOn(http, 'isDownloadable').mockResolvedValue(undefined)

      const result = await installSwiftShader(mockInstallPath)

      expect(tc.downloadTool).toHaveBeenCalledWith(mockDownloadUrl)
      expect(tc.extractZip).toHaveBeenCalledWith(mockArchivePath, mockInstallPath)
      expect(result).toBe(mockInstallPath)
    })
  })

  describe('getDownloadUrl', () => {
    it('should return the download URL for the latest SwiftShader library', async () => {
      const mockDownloadUrl = 'https://example.com/swiftshader.zip'
      jest.spyOn(versionsRasterizers, 'getLatestVersionsJson').mockResolvedValue({
        latest: {
          'swiftshader-win64': { version: '1.0.0', tag: 'v1.0.0', url: mockDownloadUrl },
          'lavapipe-win64': { version: '1.0.0', tag: 'v1.0.0', url: 'https://example.com/lavapipe.zip' }
        }
      })
      jest.spyOn(http, 'isDownloadable').mockResolvedValue(undefined)

      const result = await getDownloadUrl()

      expect(result).toBe(mockDownloadUrl)
      expect(http.isDownloadable).toHaveBeenCalledWith('SwiftShader', '1.0.0', mockDownloadUrl)
    })

    it('should handle errors when download URL is not found', async () => {
      jest.spyOn(versionsRasterizers, 'getLatestVersionsJson').mockResolvedValue({
        latest: {
          'swiftshader-win64': { version: '1.0.0', tag: 'v1.0.0', url: '' }, // Simulate missing URL
          'lavapipe-win64': { version: '1.0.0', tag: 'v1.0.0', url: 'https://example.com/lavapipe.zip' }
        }
      })
      const mockHandleError = jest.spyOn(errors, 'handleError').mockImplementation()

      await expect(getDownloadUrl()).rejects.toThrow('SwiftShader download URL not found.')
      expect(mockHandleError).toHaveBeenCalled()
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
