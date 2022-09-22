import voucherRepository from '../../src/repositories/voucherRepository'
import voucherService from "../../src/services/voucherService"
import { conflictError, notFoundError } from '../../src/utils/errorUtils'
import voucherFactory from '../factories/voucherFactory'

describe('POST /vouchers', () => {
    it('expect to create a voucher', async () => {
        const voucher = voucherFactory.createVoucher()

        jest.spyOn(voucherRepository, 'getVoucherByCode').mockResolvedValueOnce(null)
        jest.spyOn(voucherRepository, 'createVoucher').mockResolvedValueOnce(voucher)

        await expect(
            voucherService.createVoucher(voucher.code, voucher.discount)
        ).resolves.not.toThrow()

        expect(voucherRepository.getVoucherByCode).toHaveBeenCalledWith(voucher.code)
        expect(voucherRepository.createVoucher).toHaveBeenCalled()
    })

    it('expect a code already registered, throwing a conflict', async () => {
        const voucher = voucherFactory.createVoucher()

        jest.spyOn(voucherRepository, 'getVoucherByCode').mockResolvedValueOnce(voucher)

        await expect(
            voucherService.createVoucher(voucher.code, voucher.discount)
        ).rejects.toEqual(conflictError('Voucher already exist.'))

        expect(voucherRepository.getVoucherByCode).toHaveBeenCalledWith(voucher.code)
    })
})

describe('POST /vouchers/apply', () => {
    it('expect to apply a voucher with valid amount', async () => {
        const voucher = voucherFactory.createVoucher()
        const AMOUNT = 101
        const finalAmountExpected = AMOUNT - AMOUNT * (voucher.discount / 100)
        const appliedExpected = finalAmountExpected !== AMOUNT

        jest.spyOn(voucherRepository, 'getVoucherByCode').mockResolvedValueOnce(voucher)
        jest.spyOn(voucherRepository, 'useVoucher').mockResolvedValueOnce({ ...voucher, used: true })

        const {
            amount,
            discount,
            finalAmount,
            applied
        } = await voucherService.applyVoucher(voucher.code, AMOUNT)

        expect(voucherRepository.getVoucherByCode).toHaveBeenCalledWith(voucher.code)
        expect(voucherRepository.useVoucher).toHaveBeenCalledWith(voucher.code)
        expect(amount).toEqual(AMOUNT)
        expect(discount).toEqual(voucher.discount)
        expect(finalAmount).toEqual(finalAmountExpected)
        expect(applied).toEqual(appliedExpected)
    })

    it('expect to apply a voucher with invalid amount', async () => {
        const voucher = voucherFactory.createVoucher()
        const AMOUNT = 99
        const appliedExpected = false

        jest.spyOn(voucherRepository, 'getVoucherByCode').mockResolvedValueOnce(voucher)

        const {
            amount,
            discount,
            finalAmount,
            applied
        } = await voucherService.applyVoucher(voucher.code, AMOUNT)

        expect(voucherRepository.getVoucherByCode).toHaveBeenCalledWith(voucher.code)
        expect(amount).toEqual(AMOUNT)
        expect(discount).toEqual(voucher.discount)
        expect(finalAmount).toEqual(AMOUNT)
        expect(applied).toEqual(appliedExpected)
    })

    it('expect to not found a voucher registered', async () => {
        const voucher = voucherFactory.createVoucher()
        const AMOUNT = 101

        jest.spyOn(voucherRepository, 'getVoucherByCode').mockResolvedValueOnce(null)

        await expect(
            voucherService.applyVoucher(voucher.code, AMOUNT)
        ).rejects.toEqual(notFoundError('Voucher does not exist.'))

        expect(voucherRepository.getVoucherByCode).toHaveBeenCalledWith(voucher.code)
    })

})