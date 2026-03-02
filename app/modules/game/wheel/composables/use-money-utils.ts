export const useMoneyUtils = () => {
    const roundMoney = (value: number) => Math.round(value * 100) / 100

    return { roundMoney }
}
