export const utcToBeautifiedDate = (date: string | undefined) => {
    if (date) {
        const formatedDate = Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(Date.parse(date));
        return formatedDate;
    }
    return '';
};
