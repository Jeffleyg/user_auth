export const hash = jest.fn().mockImplementation((password, salt) => {
    return Promise.resolve(`hashed_${password}`);
});

export const genSalt = jest.fn().mockResolvedValue('mockedSalt');